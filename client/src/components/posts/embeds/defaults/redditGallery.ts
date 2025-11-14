import type { LinkData } from '@/types/redditApi';
import type {
  RedditGalleryContent,
  GalleryMediaItem,
} from '@/components/posts/embeds/types';

interface MediaMetadataItem {
  id: string;
  status: string;
  e: string;
  s: {
    u: string;
    x: number;
    y: number;
  };
  p: Array<{
    u: string;
    x: number;
    y: number;
  }>;
}

function redditGallery(entry: LinkData): RedditGalleryContent | null {
  if (!entry.media_metadata) {
    return null;
  }

  const media: GalleryMediaItem[] = [];

  Object.values(entry.media_metadata).forEach((value: MediaMetadataItem) => {
    if (value.status === 'valid') {
      media.push({
        key: value.id,
        type: value.e,
        source: value.s,
        thumb: value.p[0],
        preview: value.p[value.p.length - 1],
      });
    }
  });

  return {
    type: 'redditGallery',
    media,
    renderFunction: 'redditGallery',
  };
}

export default redditGallery;
