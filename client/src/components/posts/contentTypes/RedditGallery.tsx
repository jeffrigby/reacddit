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
        // For AnimatedImage types, use source (the GIF/MP4) instead of preview (static PNG)
        original: val.type === 'AnimatedImage' ? val.source.u : val.preview.u,
        thumbnail: val.thumb.u,
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
