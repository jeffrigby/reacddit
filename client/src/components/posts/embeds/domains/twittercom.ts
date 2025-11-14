import type { LinkData } from '@/types/redditApi';
import type { SocialEmbedContent } from '@/components/posts/embeds/types';

function render(entry: LinkData): SocialEmbedContent | null {
  const { url } = entry;

  if (!url) {
    return null;
  }

  return {
    type: 'social',
    network: 'x',
    url,
  };
}

export default render;
