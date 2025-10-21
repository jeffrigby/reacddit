import { getPublicSuffix, getDomain } from 'tldts';
import parse from 'url-parse';
import { LRUCache } from 'lru-cache';
import type { LinkData, CommentData } from '../../../types/redditApi';
import type {
  EmbedContent,
  DomainKeys,
  InlineLinksResult,
  HttpsErrorContent,
} from './types';
import Embeds from './embeds';
import redditVideoPreview from './defaults/redditVideoPreview';
import redditImagePreview from './defaults/redditImagePreview';
import redditMediaEmbed from './defaults/redditMediaEmbed';
import redditGallery from './defaults/redditGallery';
const urlRegex = require('url-regex-safe');

// Compile URL regex once for performance
const URL_REGEX = urlRegex();

// Reddit kind constants
const REDDIT_KIND = {
  COMMENT: 't1',
  LINK: 't3',
} as const;

// LRU cache for embed content to avoid re-processing same URLs
// Configured for long browsing sessions with lots of embedded content
// Note: We use NonNullable<EmbedContent> as the cache value type since LRUCache
// requires value types to extend {}. We handle null by checking if cached value is undefined.
const embedCache = new LRUCache<string, NonNullable<EmbedContent>>({
  max: 500, // Store up to 500 most recent embeds
  ttl: 1000 * 60 * 15, // 15 minute TTL (embeds rarely change)
  updateAgeOnGet: true, // Refresh TTL when accessing cached items
  updateAgeOnHas: false, // Don't refresh TTL on has() checks
});

/**
 * Type guard to check if entry is LinkData
 * @param entry - Entry to check
 * @returns true if entry is LinkData
 */
function isLinkData(entry: LinkData | CommentData): entry is LinkData {
  return 'domain' in entry && 'url' in entry;
}

/**
 * Type guard to check if entry is CommentData
 * @param entry - Entry to check
 * @returns true if entry is CommentData
 */
function isCommentData(entry: LinkData | CommentData): entry is CommentData {
  return 'body_html' in entry && !('domain' in entry);
}

/**
 * Try domain handlers in order: greedyDomain first, then exact domain
 * @param keys - Domain keys containing greedyDomain and domain
 * @param entry - Reddit entry to render
 * @returns Embed content with renderFunction set, or null
 */
async function tryDomainHandlers(
  keys: DomainKeys,
  entry: LinkData | CommentData
): Promise<EmbedContent> {
  // Try greedy domain first (e.g., "youtube" from "youtube.com")
  if (typeof Embeds[keys.greedyDomain] === 'function') {
    const content = await Embeds[keys.greedyDomain](entry);
    if (content) {
      return { ...content, renderFunction: keys.greedyDomain };
    }
  }

  // Try exact domain if greedy didn't match (e.g., "youtubecom")
  if (typeof Embeds[keys.domain] === 'function') {
    const content = await Embeds[keys.domain](entry);
    if (content) {
      return { ...content, renderFunction: keys.domain };
    }
  }

  return null;
}

/**
 * Extract domain keys from a URL for handler lookup
 * @param url - The URL to extract keys from
 * @returns Domain keys for handler lookup, or null if invalid
 *
 * @example
 * getKeys('https://youtube.com/watch?v=123')
 * // Returns: { domain: 'youtubecom', greedyDomain: 'youtube' }
 */
function getKeys(url: string): DomainKeys | null {
  // Regex to keep only alphanumeric characters for handler names
  const ALPHANUMERIC_ONLY = /[^a-zA-Z0-9]/g;

  // Handle self posts (text posts)
  if (url.startsWith('self.')) {
    return {
      domain: url.replace(ALPHANUMERIC_ONLY, ''),
      greedyDomain: 'self',
    };
  }

  // Extract domain using tldts library
  const parsedDomain = getDomain(url, { detectIp: false });
  const suffix = getPublicSuffix(url, { detectIp: false });

  if (!parsedDomain) {
    return null;
  }

  // Create handler-friendly names (e.g., 'youtube.com' → 'youtubecom')
  const domain = parsedDomain.replace(ALPHANUMERIC_ONLY, '');

  // Create greedy domain by removing TLD (e.g., 'youtube.com' → 'youtube')
  const greedyDomain = parsedDomain
    .replace(suffix ?? '', '')
    .replace(ALPHANUMERIC_ONLY, '');

  return { domain, greedyDomain };
}

/**
 * Extract URLs from HTML content using modern DOMParser
 * More robust than regex-based approaches, handles malformed HTML gracefully
 * @param html - HTML string to extract URLs from
 * @returns Array of URLs found in anchor tags
 */
function extractUrlsFromHtml(html: string): string[] {
  if (!html) {
    return [];
  }

  try {
    // Use native DOMParser for proper HTML parsing
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Get all anchor tags
    const anchors = Array.from(doc.querySelectorAll('a'));

    // Extract href attributes, filter for valid HTTP(S) URLs
    const urls = anchors
      .map((a) => a.href)
      .filter((href) => href?.match(/^https?:\/\//));

    return urls;
  } catch (e) {
    console.error('Error parsing HTML for URLs:', e);
    // Fallback to regex if DOMParser fails (shouldn't happen in browsers)
    return (html.match(URL_REGEX) ?? []).filter((url) =>
      url.match(/^https?:\/\//)
    );
  }
}

async function inlineLinks(
  entry: LinkData | CommentData,
  kind: string
): Promise<InlineLinksResult> {
  const textContent =
    kind === REDDIT_KIND.COMMENT
      ? isCommentData(entry)
        ? entry.body_html
        : ''
      : isLinkData(entry)
        ? entry.selftext_html
        : '';

  // Extract URLs using modern DOMParser instead of strip_tags + regex
  const links = extractUrlsFromHtml(textContent ?? '');

  const dupes: string[] = [];

  // Process all links in parallel for better performance
  const linkPromises = links.map(async (url: string) => {
    const cleanUrl = url.replace(/^\(|\)$/g, '');

    // If a match doesn't start with http skip it.
    if (!cleanUrl.match(/^http/)) {
      return null;
    }

    const keys = getKeys(cleanUrl);
    if (!keys) {
      return null;
    }

    if (dupes.includes(url)) {
      return null;
    }
    dupes.push(url);

    // Create entry with clean URL, excluding preview to avoid conflicts
    const fakeEntry = isLinkData(entry)
      ? (() => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { preview, ...entryWithoutPreview } = entry;
          return { ...entryWithoutPreview, url: cleanUrl };
        })()
      : { ...entry, url: cleanUrl };

    const embedContent = await tryDomainHandlers(keys, fakeEntry);
    if (embedContent) {
      return { url, content: embedContent };
    }

    return null;
  });

  const results = await Promise.all(linkPromises);

  // Filter out null results and build return arrays
  const inline: EmbedContent[] = [];
  const renderedLinks: string[] = [];

  results.forEach((result: { url: string; content: EmbedContent } | null) => {
    if (result) {
      renderedLinks.push(result.url);
      inline.push(result.content);
    }
  });

  return { renderedLinks, inline };
}

function nonSSLFallback(
  content: EmbedContent,
  entry: LinkData | CommentData
): EmbedContent {
  const isSSL = window.location.protocol;
  if (isSSL === 'https:' && content && 'src' in content && content.src) {
    const { protocol } = parse(content.src);
    if (protocol === 'http:') {
      // Check for preview image:
      if (
        content.renderFunction !== 'redditImagePreview' &&
        isLinkData(entry)
      ) {
        try {
          const image = redditImagePreview(entry);
          if (image) {
            return {
              ...image,
              renderFunction: 'redditImagePreview',
            };
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Return error.
      const errorContent: HttpsErrorContent = {
        ...content,
        type: 'httpserror',
      };
      return errorContent;
    }
  }
  return content;
}

/**
 * Get the content for a post.
 * @param keys - The keys to use for the content.
 * @param entry - The entry to get the content for.
 * @returns Promise resolving to embed content
 */
async function getContent(
  keys: DomainKeys,
  entry: LinkData | CommentData
): Promise<EmbedContent> {
  // is this a gallery?
  if (isLinkData(entry) && entry.is_gallery) {
    try {
      const gallery = redditGallery(entry);
      if (gallery) {
        return {
          ...gallery,
          renderFunction: 'redditGallery',
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Try domain-specific handlers
  try {
    const domainContent = await tryDomainHandlers(keys, entry);
    if (domainContent) {
      return domainContent;
    }
  } catch (e) {
    console.error(e);
  }

  // Fallback video content (only for links)
  if (isLinkData(entry)) {
    try {
      const video = redditVideoPreview(entry);
      if (video) {
        return {
          ...video,
          renderFunction: 'redditVideoPreview',
        };
      }
    } catch (e) {
      console.error(e);
    }

    // Fallback media content
    try {
      const embed = redditMediaEmbed(entry);
      if (embed) {
        return {
          ...embed,
          renderFunction: 'redditMediaEmbed',
        };
      }
    } catch (e) {
      console.error(e);
    }

    // Check for preview image:
    try {
      const image = redditImagePreview(entry);
      if (image) {
        return {
          ...image,
          renderFunction: 'redditImagePreview',
        };
      }
    } catch (e) {
      console.error(e);
    }
  }

  return null;
}

/**
 * Get the content for a post.
 * @param entry - The entry to get the content for.
 * @param kind - The kind of entry. (t1, t3, etc)
 * @returns Promise resolving to rendered content or null
 */
async function RenderContent(
  entry: LinkData | CommentData,
  kind: string
): Promise<EmbedContent> {
  // Create cache key from URL (or id for comments)
  const { id } = entry;
  const { url } = isLinkData(entry) ? entry : { url: undefined };
  const cacheKey =
    kind === REDDIT_KIND.COMMENT
      ? `comment_${id}`
      : url
        ? `link_${url}`
        : `unknown_${id}`;

  // Check cache first
  const cached = embedCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  let result: EmbedContent = null;

  try {
    if (kind === REDDIT_KIND.COMMENT) {
      const content = await getContent(
        { greedyDomain: 'comment', domain: 'comment' },
        entry
      );
      const commentInlineLinks = await inlineLinks(entry, kind);
      if (commentInlineLinks.inline.length > 0 && content) {
        result = {
          ...content,
          inline: commentInlineLinks.inline,
          inlineLinks: commentInlineLinks.renderedLinks,
        } as EmbedContent;
      } else {
        result = content;
      }
      if (result !== null) {
        embedCache.set(cacheKey, result);
      }
      return result;
    }

    // Only process links (not comments) in this branch
    if (!isLinkData(entry)) {
      return null;
    }

    const { domain, selftext_html: selfTextHtml } = entry;

    if (!domain) {
      return null;
    }

    const keys = getKeys(domain);
    if (!keys) {
      return null;
    }

    const content = await getContent(keys, entry);

    if (keys.greedyDomain === 'self' && selfTextHtml) {
      const getInline = await inlineLinks(entry, kind);
      if (getInline.inline.length > 0 && content) {
        result = {
          ...content,
          inline: getInline.inline,
          inlineLinks: getInline.renderedLinks,
        } as EmbedContent;
        if (result !== null) {
          embedCache.set(cacheKey, result);
        }
        return result;
      }
    }

    result = nonSSLFallback(content, entry);
    if (result !== null) {
      embedCache.set(cacheKey, result);
    }
    return result;
  } catch (e) {
    console.error(e);
  }
  return null;
}

export default RenderContent;
