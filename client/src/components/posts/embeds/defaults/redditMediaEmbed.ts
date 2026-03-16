import type { LinkData } from '@/types/redditApi';
import type { IFrameEmbedContent } from '@/components/posts/embeds/types';
import { sanitizeHTML, isSafeUrl } from '@/utils/sanitize';

function redditMediaEmbed(entry: LinkData): IFrameEmbedContent | null {
  if (entry.media_embed?.content) {
    const tempDiv = document.createElement('div');
    // Content is sanitized via DOMPurify before DOM insertion
    tempDiv.innerHTML = sanitizeHTML(entry.media_embed.content);
    const embed = tempDiv.firstChild as HTMLElement;
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
