import { getDomain } from 'tldts';
import { LRUCache } from 'lru-cache';
import type { LinkData, CommentData } from '@/types/redditApi';
import type { EmbedContent } from '@/components/posts/embeds/types';
import { redditAPI } from '@/reddit/redditApiTs';
import Embeds from '@/components/posts/embeds/embeds';

// Regex patterns for extracting post IDs
const REDDIT_POST_REGEX = /\/r\/[^/]+\/comments\/([a-z0-9]+)/i;
const SHORT_LINK_REGEX = /redd\.it\/([a-z0-9]+)/i;

// Marker to prevent infinite recursion
const REDDIT_EMBED_MARKER = '__reddit_embed_processed__';

// Cache for share link → post ID resolutions
// Prevents re-resolving the same share links across browsing session
// Only caches successful resolutions; failures will be retried
const shareCache = new LRUCache<string, string>({
  max: 200,
  ttl: 1000 * 60 * 30, // 30 minute TTL (share links are stable)
});

// Batch resolver: collects URLs during a render cycle, resolves in one API call
type ResolveCallback = (postId: string | null) => void;
const pendingBatch = new Map<string, ResolveCallback[]>();
let batchScheduled = false;

/**
 * Execute batch resolution for all pending URLs
 */
async function executeBatch(): Promise<void> {
  batchScheduled = false;

  // Snapshot and clear pending batch
  const batch = new Map(pendingBatch);
  pendingBatch.clear();

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
  } catch {
    resolveAll(null);
  }
}

/**
 * Extract post ID from Reddit URL
 */
function extractPostId(url: string): string | null {
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
function isShareLink(url: string): boolean {
  return url.includes('/s/');
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
      queueMicrotask(executeBatch);
    }
  });
}

/**
 * Get domain key for handler lookup (e.g., 'youtube.com' → 'youtubecom')
 */
function getDomainKey(url: string): string | null {
  const domain = getDomain(url, { detectIp: false });
  if (!domain) {
    return null;
  }
  return domain.replace(/\./g, '');
}

/**
 * Fetch post data using authenticated Reddit API
 */
async function fetchPostData(
  postId: string
): Promise<{ url: string; title: string; preview?: unknown } | null> {
  try {
    const response = await redditAPI.get('/api/info', {
      params: { id: `t3_${postId}`, raw_json: 1 },
    });

    const post = response.data?.data?.children?.[0]?.data as
      | { url?: string; title?: string; preview?: unknown }
      | undefined;

    if (!post?.url) {
      return null;
    }

    return {
      url: post.url,
      title: post.title ?? '',
      preview: post.preview,
    };
  } catch {
    return null;
  }
}

/**
 * Try to render content using a domain handler
 */
async function tryDomainHandler(
  domainKey: string,
  entry: LinkData | CommentData
): Promise<EmbedContent> {
  if (typeof Embeds[domainKey] !== 'function') {
    return null;
  }

  try {
    const content = await Embeds[domainKey](entry);
    return content ? { ...content, renderFunction: domainKey } : null;
  } catch {
    return null;
  }
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
 *
 * Does NOT support (CORS blocks redirects):
 * - Share links: reddit.com/r/sub/s/xyz
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

  // Get domain handler key for the linked URL
  const domainKey = getDomainKey(linkedUrl);

  // Skip if no handler or if linked URL is also a Reddit post (prevent recursion)
  if (!domainKey || domainKey === 'redditcom') {
    return null;
  }

  // Create a synthetic entry with the linked post's URL and render
  const syntheticEntry = {
    ...entry,
    url: linkedUrl,
    [REDDIT_EMBED_MARKER]: true,
  } as unknown as LinkData | CommentData;

  return tryDomainHandler(domainKey, syntheticEntry);
}

export default render;
