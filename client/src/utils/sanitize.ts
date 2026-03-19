import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content for safe rendering.
 * Strips scripts, event handlers, and other dangerous content while
 * preserving safe formatting tags.
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
}

/**
 * Check if a URL uses a safe protocol.
 * @param url - URL string to validate
 * @param httpsOnly - If true, only allow https:. If false, allow https: and http:.
 * @returns true if the URL protocol is allowed
 */
export function isSafeUrl(url: string, httpsOnly = false): boolean {
  try {
    const { protocol } = new URL(url);
    return httpsOnly
      ? protocol === 'https:'
      : protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Sanitize a URL for use in an anchor tag href attribute.
 * Allows http:, https:, and mailto: protocols via isSafeUrl.
 * Returns '#' for unsafe or malformed URLs.
 */
export function sanitizeHref(url: string): string {
  try {
    const { protocol } = new URL(url);
    if (
      protocol === 'https:' ||
      protocol === 'http:' ||
      protocol === 'mailto:'
    ) {
      return url;
    }
    return '#';
  } catch {
    return '#';
  }
}

// Reuse a single textarea element for entity decoding
const textareaDecoder = document.createElement('textarea');

export function decodeHTMLEntities(text: string): string {
  textareaDecoder.innerHTML = text;
  return textareaDecoder.value;
}
