import { LRUCache } from 'lru-cache';
import PQueue from 'p-queue';
import type { LinkData, CommentData } from '@/types/redditApi';
import type { EmbedContent } from '@/components/posts/embeds/types';
import { redditAPI } from '@/reddit/redditApiTs';
import { getKeys, tryDomainHandlers } from '@/components/posts/embeds/embeds';

// Regex patterns for extracting post IDs
const REDDIT_POST_REGEX = /\/r\/[^/]+\/comments\/([a-z0-9]+)/i;
const SHORT_LINK_REGEX = /redd\.it\/([a-z0-9]+)/i;

// Marker to prevent infinite recursion
const REDDIT_EMBED_MARKER = '__reddit_embed_processed__';

// Regex for matching Reddit share links (mirrors server-side SHARE_LINK_REGEX)
const SHARE_LINK_PATTERN =
  /^https?:\/\/(www\.)?reddit\.com\/r\/[a-zA-Z0-9_]+\/s\/[a-zA-Z0-9]+\/?$/;

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
  preview?: unknown;
}

// Cache for post data to avoid redundant /api/info calls
const postDataCache = new LRUCache<string, PostData>({
  max: 500,
  ttl: 1000 * 60 * 15, // 15 min
});

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

  try {
    const response = await fetch('/api/resolve-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: Array.from(batch.keys()) }),
    });

    if (!response.ok) {
      console.error(`Share link batch resolution failed: ${response.status}`);
      resolveAll(null);
      return;
    }

    const data = (await response.json()) as {
      results: Record<string, { postId?: string; error?: string }>;
    };

    // Distribute results to all waiting callers
    batch.forEach((callbacks, url) => {
      const postId = data.results[url]?.postId ?? null;
      if (postId) {
        shareCache.set(url, postId);
      }
      callbacks.forEach((cb) => cb(postId));
    });
  } catch (error) {
    console.error('Share link batch resolution error:', error);
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
 * Check if URL is a share link (cannot be resolved client-side due to CORS)
 */
export function isShareLink(url: string): boolean {
  return /\/r\/[^/]+\/s\/[a-zA-Z0-9]+/.test(url);
}

/**
 * Check if URL is a Reddit share link using the full pattern.
 * More specific than isShareLink — used for pre-scanning raw URLs before domain filtering.
 */
export function isRedditShareLink(url: string): boolean {
  return SHARE_LINK_PATTERN.test(url);
}

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
      // Create a shared promise for each URL in this chunk so resolveShareLink can await it
      let resolveChunkPromise: (value: void) => void = () => {};
      const chunkPromise = new Promise<void>((r) => {
        resolveChunkPromise = r;
      });

      // Register in-flight promises for each URL
      for (const url of chunk) {
        const urlPromise = chunkPromise.then(() => shareCache.get(url) ?? null);
        inFlightResolutions.set(url, urlPromise);
      }

      try {
        const response = await fetch('/api/resolve-share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: chunk }),
        });

        if (response.ok) {
          const data = (await response.json()) as {
            results: Record<string, { postId?: string; error?: string }>;
          };

          for (const url of chunk) {
            const postId = data.results[url]?.postId;
            if (postId) {
              shareCache.set(url, postId);
            }
          }
        } else {
          console.warn(
            `Share link batch resolution returned ${response.status} for ${chunk.length} URLs`
          );
        }
      } catch (error) {
        console.error('Share link batch resolution error:', error);
      } finally {
        resolveChunkPromise();
        for (const url of chunk) {
          inFlightResolutions.delete(url);
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
 * Parse a single child from a Reddit /api/info response into PostData
 */
function parsePostChild(data: {
  url?: string;
  title?: string;
  preview?: unknown;
}): PostData | null {
  if (!data.url) {
    return null;
  }
  return { url: data.url, title: data.title ?? '', preview: data.preview };
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

  return redditApiQueue.add(async () => {
    // Double-check cache — may have been populated while waiting in queue
    const rechecked = postDataCache.get(postId);
    if (rechecked) {
      return rechecked;
    }

    try {
      const response = await redditAPI.get('/api/info', {
        params: { id: `t3_${postId}`, raw_json: 1 },
      });

      const child = response.data?.data?.children?.[0]?.data as
        | { url?: string; title?: string; preview?: unknown }
        | undefined;

      const postData = child ? parsePostChild(child) : null;
      if (!postData) {
        return null;
      }

      postDataCache.set(postId, postData);
      return postData;
    } catch (error) {
      console.error(`Failed to fetch post data for ${postId}:`, error);
      return null;
    }
  });
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
    try {
      const ids = chunk.map((id) => `t3_${id}`).join(',');
      const response = await redditAPI.get('/api/info', {
        params: { id: ids, raw_json: 1 },
      });

      const children = response.data?.data?.children as
        | Array<{
            data: {
              id?: string;
              url?: string;
              title?: string;
              preview?: unknown;
            };
          }>
        | undefined;

      if (children) {
        for (const child of children) {
          const postData = parsePostChild(child.data);
          if (child.data.id && postData) {
            postDataCache.set(child.data.id, postData);
          }
        }
      }
    } catch (error) {
      console.error(
        `Failed to prefetch post data for chunk of ${chunk.length} IDs:`,
        error
      );
    }
  };

  await Promise.all(
    chunks.map((chunk) => redditApiQueue.add(() => fetchChunk(chunk)))
  );
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
async function render(entry: LinkData | CommentData): Promise<EmbedContent> {
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
    // Share links require server-side resolution due to CORS
    postId = await resolveShareLink(url);
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

  // Get domain handler keys for the linked URL
  const keys = getKeys(linkedUrl);

  // Skip if no handler or if linked URL is also a Reddit post (prevent recursion)
  if (!keys || keys.domain === 'redditcom') {
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
