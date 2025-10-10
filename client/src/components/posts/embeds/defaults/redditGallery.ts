import type { LinkData } from '../../../../types/redditApi';
import type { RedditGalleryContent, GalleryMediaItem } from '../types';

interface MediaMetadataItem {
  id: string;
  status: string;
  e: string;
  s: {
    url: string;
    width: number;
    height: number;
  };
  p: Array<{
    url: string;
    width: number;
    height: number;
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
