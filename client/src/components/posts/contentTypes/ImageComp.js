import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

/**
 * Retrieves the metadata of an image from the specified URL.
 * @param {string} url - The URL of the image.
 * @returns {Promise<{ width: number, height: number }>} - A promise that resolves to an object containing the width and height of the image.
 * @throws {Error} - An error is thrown if the image fails to load.
 */
const getMeta = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = url;
  });

const ImageComp = React.memo(({ content }) => {
  const { isLoaded } = useContext(PostsContextData);
  const { title, width, height, src } = content;

  const [aspectRatio, setAspectRatio] = useState(
    width && height ? width / height : null
  );

  const fetchImageMetadata = useCallback(async () => {
    if (aspectRatio) return; // Skip if we already have the aspect ratio
    try {
      const { width: metaWidth, height: metaHeight } = await getMeta(src);
      setAspectRatio(metaWidth / metaHeight);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading image:', error);
    }
  }, [content.src, aspectRatio]);

  useEffect(() => {
    fetchImageMetadata();
  }, [fetchImageMetadata]);

  const style = useMemo(
    () => ({
      aspectRatio: aspectRatio ? `${aspectRatio}` : undefined,
      maxHeight: height < 740 ? height : undefined,
    }),
    [aspectRatio]
  );

  const imgClass = content.class ? `${content.class}` : null;

  if (!aspectRatio) return null;

  return (
    <div className="media-cont black-bg">
      <div style={style} className="media-ratio">
        <img src={isLoaded ? src : ''} alt={title} className={imgClass} />
      </div>
    </div>
  );
});

ImageComp.propTypes = {
  content: PropTypes.shape({
    src: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    class: PropTypes.string,
  }).isRequired,
};

ImageComp.displayName = 'ImageComp';

export default ImageComp;
