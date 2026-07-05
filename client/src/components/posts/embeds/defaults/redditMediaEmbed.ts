import type { LinkData } from '@/types/redditApi';
import type { IFrameEmbedContent } from '@/components/posts/embeds/types';
import { sanitizeEmbedHTML, isSafeUrl } from '@/utils/sanitize';

function redditMediaEmbed(entry: LinkData): IFrameEmbedContent | null {
  if (entry.media_embed?.content) {
    const tempDiv = document.createElement('div');
    // Content (a Reddit oEmbed/embedly iframe) is sanitized via DOMPurify,
    // which preserves the <iframe> tag but strips scripts and dangerous URIs.
    tempDiv.innerHTML = sanitizeEmbedHTML(entry.media_embed.content);
    const embed = tempDiv.firstElementChild;

    // Guard against an empty/stripped fragment (e.g. nothing survived
    // sanitization) so we don't throw on a null element.
    if (!embed) {
      return null;
    }

    const src = embed.getAttribute('src');
    const allow = embed.getAttribute('allow');

    if (!src) {
      return null;
    }

    // Block dangerous protocols (javascript:, data:, vbscript:, etc.)
    if (!isSafeUrl(src)) {
      return null;
    }

    return {
      type: 'iframe',
      src,
      allow: allow ?? undefined,
    };
  }
  return null;
}

export default redditMediaEmbed;
