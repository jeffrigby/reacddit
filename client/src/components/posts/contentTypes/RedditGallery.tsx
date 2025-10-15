import { useMemo } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import type { RedditGalleryContent } from './types';

interface RedditGalleryProps {
  content: RedditGalleryContent;
}

interface GalleryImage {
  original: string;
  thumbnail: string;
}

function RedditGallery({ content }: RedditGalleryProps) {
  const { media } = content;

  const images = useMemo<GalleryImage[]>(
    () =>
      media.map((val) => ({
        original: val.preview.url,
        thumbnail: val.thumb.url,
      })),
    [media]
  );

  return (
    <div className="redditGallery">
      <ImageGallery
        items={images}
        showFullscreenButton={false}
        showPlayButton={false}
      />
    </div>
  );
}

export default RedditGallery;
