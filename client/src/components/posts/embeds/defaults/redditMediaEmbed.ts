import type { LinkData } from '../../../../types/redditApi';
import type { IFrameEmbedContent } from '../types';

function redditMediaEmbed(entry: LinkData): IFrameEmbedContent | null {
  // Get it out of media embed:
  if (entry.media_embed?.content) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = entry.media_embed.content;
    const embed = tempDiv.firstChild as HTMLElement;
    const src = embed.getAttribute('src');
    const allow = embed.getAttribute('allow');

    if (!src) {
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
