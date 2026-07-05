import { LRUCache } from 'lru-cache';
import PQueue from 'p-queue';
import type {
  LinkData,
  CommentData,
  Listing,
  RedditThing,
} from '@/types/redditApi';
import type {
  EmbedContent,
  ImageEmbedContent,
} from '@/components/posts/embeds/types';
import { redditAPI } from '@/reddit/redditApiTs';
import { getKeys, tryDomainHandlers } from '@/components/posts/embeds/embeds';
import { getAxiosErrorStatus } from '@/utils/axiosError';
import { isSafeUrl } from '@/utils/sanitize';

// Regex patterns for extracting post IDs
const REDDIT_POST_REGEX = /\/r\/[^/]+\/comments\/([a-z0-9]+)/i;
// Bare redd.it short link. Anchored to a host boundary (`//` or start-of-string,
// with an optional `www.`) so it ONLY matches the bare redd.it host and NEVER a
// media subdomain such as i.redd.it, v.redd.it or preview.redd.it — whose paths
// are image/video FILENAMES, not post IDs. Matches: https://redd.it/<id>,
// //redd.it/<id>, www.redd.it/<id>. Rejects: https://i.redd.it/<file>.jpeg.
const SHORT_LINK_REGEX = /(?:^|\/\/)(?:www\.)?redd\.it\/([a-z0-9]+)/i;

// Reddit media hosts that serve direct, embeddable image files.
const REDDIT_IMAGE_HOSTS = new Set(['i.redd.it', 'preview.redd.it']);
// Image extensions we can render directly from a Reddit media host.
const REDDIT_IMAGE_EXTENSION_REGEX = /\.(jpg|jpeg|png|gif|webp)$/i;

// Marker to prevent infinite recursion
const REDDIT_EMBED_MARKER = '__reddit_embed_processed__';

// Canonical Reddit share-link pattern. MUST stay in sync with the server's
// SHARE_LINK_REGEX in api/src/app.ts (HTTPS-only, anchored, reddit.com host).
// Links that don't match this exactly are rejected by the resolver server, so
// the client must use the identical pattern to decide what to batch/resolve.
export const SHARE_LINK_PATTERN =
  /^https:\/\/(www\.)?reddit\.com\/r\/[a-zA-Z0-9_]+\/s\/[a-zA-Z0-9]+\/?$/;

// Max URLs per batch request (must match server MAX_BATCH_SIZE)
const MAX_BATCH_SIZE = 50;

// Max IDs per Reddit /api/info request
const REDDIT_API_INFO_LIMIT = 100;

/**
 * Split an array into chunks of a given size
 */
function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

interface PostData {
  url: string;
  title: string;
}

/**
 * Shape of the response from POST /api/resolve-share.
 * Each input URL maps to either a resolved postId or an error string.
 */
interface ResolveShareResponse {
  results: Record<string, { postId?: string; error?: string }>;
}

function logShareError(
  operation: string,
  message: string,
  ctx: Record<string, unknown>,
  error: unknown
): void {
  console.error(`redditcom.${operation}: ${message}`, {
    ...ctx,
    status: getAxiosErrorStatus(error),
    error,
  });
}

function firstChildData<T extends RedditThing['data']>(
  listing: Listing<T> | undefined
): Partial<T> | undefined {
  return listing?.data?.children?.[0]?.data;
}

// Cache for post data to avoid redundant /api/info calls
const postDataCache = new LRUCache<string, PostData>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 min
});

// In-flight post-data fetches keyed by postId. Multiple concurrent render()
// calls for the same post (very common when many cross-posts point at one
// thread) share a single /api/info request instead of each enqueueing a
// duplicate. Entries are deleted when the request settles — on both success
// and failure — so a failed fetch never poisons a later retry.
const inFlightPostData = new Map<string, Promise<PostData | null>>();

// Rate-limited queue for Reddit OAuth API calls (shared across all posts on screen).
// Reddit OAuth limit is ~100 req/min; with batching this is mostly a safety net.
const redditApiQueue = new PQueue({
  concurrency: 10,
  interval: 1000,
  intervalCap: 10,
});

// Cache for share link → post ID resolutions
// Prevents re-resolving the same share links across browsing session
// Only caches successful resolutions; failures will be retried
const shareCache = new LRUCache<string, string>({
  max: 200,
  ttl: 1000 * 60 * 30, // 30 minute TTL (share links are stable)
});

// In-flight bulk resolutions: allows resolveShareLink to await ongoing resolveShareLinks calls
const inFlightResolutions = new Map<string, Promise<string | null>>();

// Batch resolver: collects URLs during a render cycle, resolves in one API call
type ResolveCallback = (postId: string | null) => void;
let pendingBatch = new Map<string, ResolveCallback[]>();
let batchScheduled = false;

/**
 * Execute batch resolution for all pending URLs
 */
async function executeBatch(): Promise<void> {
  batchScheduled = false;

  // Snapshot and clear pending batch
  const batch = pendingBatch;
  pendingBatch = new Map();

  if (batch.size === 0) {
    return;
  }

  const resolveAll = (postId: string | null): void => {
    batch.forEach((callbacks) => callbacks.forEach((cb) => cb(postId)));
  };

  const urls = Array.from(batch.keys());

  try {
    const response = await fetch('/api/resolve-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      console.error(
        'redditcom.executeBatch: HTTP error from /api/resolve-share',
        {
          operation: 'executeBatch',
          status: response.status,
          statusText: response.statusText,
          urlCount: urls.length,
          urls,
        }
      );
      resolveAll(null);
      return;
    }

    const data = (await response.json()) as ResolveShareResponse;

    // Distribute results to all waiting callers
    batch.forEach((callbacks, url) => {
      const postId = data.results[url]?.postId ?? null;
      if (postId) {
        shareCache.set(url, postId);
      }
      callbacks.forEach((cb) => cb(postId));
    });
  } catch (error) {
    logShareError(
      'executeBatch',
      'failed to resolve share links',
      { operation: 'executeBatch', urlCount: urls.length, urls },
      error
    );
    resolveAll(null);
  }
}

/**
 * Extract post ID from Reddit URL
 */
export function extractPostId(url: string): string | null {
  // Try standard reddit.com URL
  const standardMatch = url.match(REDDIT_POST_REGEX);
  if (standardMatch) {
    return standardMatch[1];
  }

  // Try redd.it short link
  const shortMatch = url.match(SHORT_LINK_REGEX);
  if (shortMatch) {
    return shortMatch[1];
  }

  return null;
}

/**
 * Check if a URL is a Reddit share link (/r/<sub>/s/<code>).
 *
 * Share links cannot be resolved client-side (CORS) and are resolved by the
 * server via POST /api/resolve-share. This uses the canonical SHARE_LINK_PATTERN
 * so the client agrees exactly with what the server will accept — divergent
 * links would otherwise be sent individually and then rejected by the server.
 */
export function isShareLink(url: string): boolean {
  return SHARE_LINK_PATTERN.test(url);
}

/**
 * Check if a URL is a Reddit share link.
 *
 * Alias of {@link isShareLink} — both use the canonical SHARE_LINK_PATTERN.
 * Kept as a distinct export for the pre-scan call site in the embeds index,
 * which filters raw URLs before domain handling.
 */
export const isRedditShareLink = isShareLink;

/**
 * Bulk-resolve Reddit share links in a single batch API call.
 * Results are stored in shareCache so subsequent resolveShareLink() calls hit cache.
 * Fails silently — individual URLs will retry via resolveShareLink fallback.
 */
export async function resolveShareLinks(
  urls: string[]
): Promise<Map<string, string>> {
  // Filter out already-cached URLs
  const uncached = urls.filter((url) => shareCache.get(url) === undefined);

  if (uncached.length > 0) {
    const chunks = chunkArray(uncached, MAX_BATCH_SIZE);

    // Process chunks sequentially to avoid overwhelming the server
    for (const chunk of chunks) {
      // Shared per-chunk promise that resolveShareLink awaiters hang off of.
      // It settles with `true` when the chunk request succeeds (HTTP 2xx) and
      // rejects when it fails (network error / non-2xx). On failure, awaiters
      // reject so they can retry on a later render instead of being pinned to
      // null; shareCache is left untouched so the URL remains a cache miss.
      let settleChunk: (succeeded: boolean) => void = () => {};
      let failChunk: (reason: Error) => void = () => {};
      const chunkSettled = new Promise<boolean>((resolve, reject) => {
        settleChunk = resolve;
        failChunk = reject;
      });
      // Swallow rejections on the shared promise itself so that URLs whose
      // in-flight promise is never awaited don't surface as unhandled rejections.
      chunkSettled.catch(() => {});

      // Register in-flight promises for each URL. On chunk success, resolve to
      // the cached postId (or null if the server returned no result for this
      // URL); on chunk failure, propagate the rejection so the awaiter retries.
      for (const url of chunk) {
        const urlPromise = chunkSettled.then(() => shareCache.get(url) ?? null);
        // Prevent unhandled rejections on stored promises that are never awaited.
        urlPromise.catch(() => {});
        inFlightResolutions.set(url, urlPromise);
      }

      let chunkError: Error | null = null;
      try {
        const response = await fetch('/api/resolve-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: chunk }),
        });

        if (response.ok) {
          const data = (await response.json()) as ResolveShareResponse;

          for (const url of chunk) {
            const postId = data.results[url]?.postId;
            if (postId) {
              shareCache.set(url, postId);
            }
          }
        } else {
          chunkError = new Error(
            `resolve-share failed: ${response.status} ${response.statusText}`
          );
          console.warn(
            'redditcom.resolveShareLinks: HTTP error from /api/resolve-share',
            {
              operation: 'resolveShareLinks',
              status: response.status,
              statusText: response.statusText,
              chunkSize: chunk.length,
              urls: chunk,
            }
          );
        }
      } catch (error) {
        chunkError = error instanceof Error ? error : new Error(String(error));
        logShareError(
          'resolveShareLinks',
          'failed to resolve share-link chunk',
          {
            operation: 'resolveShareLinks',
            chunkSize: chunk.length,
            urls: chunk,
          },
          error
        );
      } finally {
        // Remove in-flight entries first so any retry after this point starts
        // a fresh resolution rather than reusing a settled (possibly rejected)
        // promise.
        for (const url of chunk) {
          inFlightResolutions.delete(url);
        }
        if (chunkError) {
          failChunk(chunkError);
        } else {
          settleChunk(true);
        }
      }
    }
  }

  // Build result map from cache for all input URLs
  const result = new Map<string, string>();
  for (const url of urls) {
    const postId = shareCache.get(url);
    if (postId) {
      result.set(url, postId);
    }
  }
  return result;
}

/**
 * Resolve share link via batched API call
 * Uses microtask scheduling to batch all requests from a render cycle
 */
function resolveShareLink(url: string): Promise<string | null> {
  const cached = shareCache.get(url);
  if (cached !== undefined) {
    return Promise.resolve(cached);
  }

  // If this URL is being resolved by a bulk resolveShareLinks call, await that
  const inFlight = inFlightResolutions.get(url);
  if (inFlight) {
    return inFlight;
  }

  return new Promise((resolve) => {
    // Add to pending batch (supports multiple callers for same URL)
    const callbacks = pendingBatch.get(url);
    if (callbacks) {
      callbacks.push(resolve);
    } else {
      pendingBatch.set(url, [resolve]);
    }

    // Schedule batch execution on next microtask
    if (!batchScheduled) {
      batchScheduled = true;
      queueMicrotask(() => {
        executeBatch().catch(console.error);
      });
    }
  });
}

/**
 * Parse a single child's `data` field from a Reddit /api/info Listing<LinkData>
 * response into a minimal PostData. Returns null when the URL is missing.
 */
function parsePostChild(data: Partial<LinkData>): PostData | null {
  if (!data.url) {
    return null;
  }
  return { url: data.url, title: data.title ?? '' };
}

/**
 * Fetch post data using authenticated Reddit API.
 * Checks postDataCache first; queues through redditApiQueue for rate limiting.
 */
async function fetchPostData(postId: string): Promise<PostData | null> {
  const cached = postDataCache.get(postId);
  if (cached) {
    return cached;
  }

  // Coalesce concurrent callers onto a single in-flight request.
  const inFlight = inFlightPostData.get(postId);
  if (inFlight) {
    return inFlight;
  }

  const request = redditApiQueue.add(async (): Promise<PostData | null> => {
    // Double-check cache — may have been populated while waiting in queue
    const rechecked = postDataCache.get(postId);
    if (rechecked) {
      return rechecked;
    }

    const url = `/api/info?id=t3_${postId}`;

    try {
      const response = await redditAPI.get<Listing<LinkData>>('/api/info', {
        params: { id: `t3_${postId}`, raw_json: 1 },
      });

      const child = firstChildData(response.data);

      const postData = child ? parsePostChild(child) : null;
      if (!postData) {
        return null;
      }

      postDataCache.set(postId, postData);
      return postData;
    } catch (error) {
      logShareError(
        'fetchPostData',
        'failed to fetch post',
        { operation: 'fetchPostData', postId, url },
        error
      );
      return null;
    }
  });

  // Clear the in-flight entry once settled (success or failure) so future
  // callers either hit the cache or start a fresh request. `tracked` is the
  // promise both stored and returned, so every coalesced caller resolves with
  // the same result.
  const tracked = request.finally(() => {
    inFlightPostData.delete(postId);
  });
  inFlightPostData.set(postId, tracked);
  return tracked;
}

/**
 * Batch pre-fetch post data for multiple Reddit post IDs.
 * Chunks into groups of 100 (Reddit API limit) and queues through redditApiQueue.
 * Fails silently — individual fetchPostData calls retry as fallback.
 */
export async function prefetchPostData(postIds: string[]): Promise<void> {
  // Filter out already-cached and deduplicate
  const unique = [...new Set(postIds)].filter((id) => !postDataCache.has(id));
  if (unique.length === 0) {
    return;
  }

  const chunks = chunkArray(unique, REDDIT_API_INFO_LIMIT);

  const fetchChunk = async (chunk: string[]): Promise<void> => {
    const ids = chunk.map((id) => `t3_${id}`).join(',');
    const url = `/api/info?id=${ids}`;
    try {
      const response = await redditAPI.get<Listing<LinkData>>('/api/info', {
        params: { id: ids, raw_json: 1 },
      });

      const children = response.data?.data?.children;

      if (children) {
        for (const child of children) {
          const data = child.data as Partial<LinkData>;
          const postData = parsePostChild(data);
          if (data.id && postData) {
            postDataCache.set(data.id, postData);
          }
        }
      }
    } catch (error) {
      logShareError(
        'prefetchPostData',
        'failed to prefetch chunk',
        {
          operation: 'prefetchPostData',
          chunkSize: chunk.length,
          postIds: chunk,
          url,
        },
        error
      );
    }
  };

  await Promise.all(
    chunks.map((chunk) => redditApiQueue.add(() => fetchChunk(chunk)))
  );
}

/**
 * Build an image EmbedContent for a direct Reddit-hosted image URL.
 *
 * When a cross-post's linked URL is a direct Reddit media image
 * (i.redd.it / preview.redd.it with an image extension), it is directly
 * embeddable and must be rendered here. getKeys() maps such URLs back to the
 * 'redd' handler — an alias of this very file — which short-circuits on
 * REDDIT_EMBED_MARKER and would silently drop the image. Returns null for any
 * URL that is not a safe, direct Reddit-hosted image (e.g. v.redd.it videos,
 * which lack DASH/media info in PostData and are not embedded here).
 */
function buildRedditImageContent(
  url: string,
  title: string
): ImageEmbedContent | null {
  // Enforce the project's URL safety policy before embedding.
  if (!isSafeUrl(url)) {
    return null;
  }

  let host: string;
  let pathname: string;
  try {
    const parsed = new URL(url);
    host = parsed.hostname.toLowerCase();
    pathname = parsed.pathname;
  } catch {
    return null;
  }

  if (!REDDIT_IMAGE_HOSTS.has(host)) {
    return null;
  }

  if (!REDDIT_IMAGE_EXTENSION_REGEX.test(pathname)) {
    return null;
  }

  // Dimensions are unknown here (PostData carries only url + title); ImageComp
  // derives the aspect ratio from the loaded image when width/height are absent.
  return {
    type: 'image',
    src: url,
    title,
  };
}

/**
 * Handler for Reddit post links
 *
 * When a post links to another Reddit post, fetch the linked post's data
 * and render its media content using existing domain handlers.
 *
 * Supports:
 * - Standard URLs: reddit.com/r/sub/comments/abc123/...
 * - Short links: redd.it/abc123
 * - Share links: reddit.com/r/sub/s/xyz (resolved server-side via /api/resolve-share)
 */
async function render(
  entry: LinkData | CommentData
): Promise<EmbedContent | null> {
  // Get URL from entry
  const url = 'url' in entry ? entry.url : undefined;

  if (!url) {
    return null;
  }

  // Prevent infinite recursion - if already processed, return null
  if (REDDIT_EMBED_MARKER in entry) {
    return null;
  }

  // Extract post ID from URL, or resolve share links via API
  let postId: string | null = null;

  if (isShareLink(url)) {
    // Share links require server-side resolution due to CORS.
    // A rejected resolution means the batch/individual request failed; return
    // null for THIS render so the embed simply doesn't appear, while leaving
    // the URL uncached so a later render can retry the resolution.
    try {
      postId = await resolveShareLink(url);
    } catch {
      return null;
    }
  } else {
    postId = extractPostId(url);
  }

  if (!postId) {
    return null;
  }

  // Fetch the linked post's data via OAuth API
  const postData = await fetchPostData(postId);

  if (!postData) {
    return null;
  }

  const linkedUrl = postData.url;

  // Skip if linked post points to itself (self post with no external media)
  if (linkedUrl.startsWith('self.') || linkedUrl.includes('/comments/')) {
    return null;
  }

  // Direct Reddit-hosted image (i.redd.it / preview.redd.it): render it now.
  // This MUST run before the recursion guard below — getKeys() maps these URLs
  // to the 'redd' handler (an alias of this file) which would null them out via
  // REDDIT_EMBED_MARKER, silently dropping a perfectly embeddable image.
  const redditImage = buildRedditImageContent(linkedUrl, postData.title);
  if (redditImage) {
    return redditImage;
  }

  // Get domain handler keys for the linked URL
  const keys = getKeys(linkedUrl);

  // Skip if no handler, or if the linked URL maps back to the reddit family of
  // handlers (reddit.com → redditcom/reddit; redd.it & its media subdomains →
  // reddit/redd). Those all route back through this file and would either
  // recurse or short-circuit on REDDIT_EMBED_MARKER, so stop here. Directly
  // embeddable Reddit images already returned above.
  if (
    !keys ||
    keys.domain === 'redditcom' ||
    keys.greedyDomain === 'reddit' ||
    keys.domain === 'reddit' ||
    keys.greedyDomain === 'redd'
  ) {
    return null;
  }

  // Create a synthetic entry with the linked post's URL and render
  const syntheticEntry = {
    ...entry,
    url: linkedUrl,
    [REDDIT_EMBED_MARKER]: true,
  } as unknown as LinkData | CommentData;

  return tryDomainHandlers(keys, syntheticEntry);
}

export default render;
