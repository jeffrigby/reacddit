import DOMPurify from 'dompurify';

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/**
 * Sanitize HTML content for safe rendering.
 * Strips scripts, event handlers, and other dangerous content while
 * preserving safe formatting tags.
 */
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['target'],
  });
}

/**
 * Sanitize HTML for embedded media (oEmbed/embedly iframes from Reddit).
 *
 * Unlike sanitizeHTML, this preserves the <iframe> element and a tight
 * allowlist of presentational attributes so the iframe's src/allow can be
 * extracted safely. DOMPurify still strips scripts, event handlers, and
 * dangerous URI schemes; callers MUST additionally validate any extracted
 * src with isSafeUrl before use.
 */
export function sanitizeEmbedHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: [
      'src',
      'allow',
      'allowfullscreen',
      'frameborder',
      'width',
      'height',
      'scrolling',
      'title',
      'style',
    ],
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
 * Allows http:, https:, and mailto: protocols.
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

// Lazily initialized textarea element for HTML entity decoding.
// Uses innerHTML on an off-DOM textarea — this is a standard safe pattern
// for decoding entities like &amp; → & without executing scripts.
let textareaDecoder: HTMLTextAreaElement | null = null;

export function decodeHTMLEntities(text: string): string {
  textareaDecoder ??= document.createElement('textarea');
  textareaDecoder.innerHTML = text; // Safe: textarea never added to DOM, no script execution
  return textareaDecoder.value;
}
