import { useMemo } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/image-gallery.css';
import { usePostContext } from '@/contexts';
import type { LinkData, CommentData } from '@/types/redditApi';
import type { RedditGalleryContent } from '@/components/posts/embeds/types';

interface RedditGalleryProps {
  content: RedditGalleryContent;
}

interface GalleryImage {
  original: string;
  thumbnail: string;
  originalAlt: string;
  thumbnailAlt: string;
}

// A gallery only ever exists on a link post, but the context data is a union.
function isLinkData(data: LinkData | CommentData): data is LinkData {
  return 'domain' in data && 'url' in data;
}

function RedditGallery({ content }: RedditGalleryProps) {
  const { media } = content;
  const postContext = usePostContext();
  const { post } = postContext;
  const { data } = post;

  const title = isLinkData(data) ? data.title : '';

  const images = useMemo<GalleryImage[]>(
    () =>
      media.map((val, idx) => ({
        // For AnimatedImage types, use source (the GIF/MP4) instead of preview (static PNG)
        original: val.type === 'AnimatedImage' ? val.source.u : val.preview.u,
        thumbnail: val.thumb.u,
        originalAlt: `${title} (image ${idx + 1} of ${media.length})`,
        // The thumbnail button already carries an aria-label, so the image
        // itself is decorative.
        thumbnailAlt: '',
      })),
    [media, title]
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
