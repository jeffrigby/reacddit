import {
  memo,
  useContext,
  useEffect,
  useState,
  useMemo,
  type CSSProperties,
} from 'react';
import { PostsContextData, type PostContextData } from '@/contexts';
import type { ImageContent } from './types';

interface ImageMetadata {
  width: number;
  height: number;
}

interface ImageCompProps {
  content: ImageContent;
}

/**
 * Retrieves the metadata of an image from the specified URL.
 * @param url - The URL of the image.
 * @returns A promise that resolves to an object containing the width and height of the image.
 * @throws An error is thrown if the image fails to load.
 */
function getMeta(url: string): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = (error) => {
      img.onload = null;
      img.onerror = null;
      reject(error);
    };
    img.src = url;
  });
}

function ImageComp({ content }: ImageCompProps) {
  const { isLoaded, idx } = useContext(PostsContextData) as PostContextData;
  const { title, width, height, src } = content;

  const [aspectRatio, setAspectRatio] = useState<number | null>(
    width && height ? width / height : null
  );

  useEffect(() => {
    if (aspectRatio) {
      return;
    }

    let isMounted = true;

    const fetchImageMetadata = async () => {
      try {
        const { width: metaWidth, height: metaHeight } = await getMeta(src);
        if (isMounted) {
          setAspectRatio(metaWidth / metaHeight);
        }
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    fetchImageMetadata();

    return () => {
      isMounted = false;
    };
  }, [src, aspectRatio]);

  const style = useMemo<CSSProperties>(
    () => ({
      aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      maxHeight: height && height < 740 ? height : undefined,
    }),
    [aspectRatio, height]
  );

  const imgClass = content.class ? `${content.class}` : undefined;

  if (!aspectRatio) {
    return null;
  }

  return (
    <div className="media-cont black-bg">
      <div className="media-ratio" style={style}>
        {isLoaded ? (
          <img
            alt={title}
            className={imgClass}
            fetchPriority={idx === 0 ? 'high' : 'auto'}
            src={src}
          />
        ) : (
          <div className="image-placeholder" style={style} />
        )}
      </div>
    </div>
  );
}

const MemoizedImageComp = memo(ImageComp);
MemoizedImageComp.displayName = 'ImageComp';

export default MemoizedImageComp;
