import { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

function getMeta(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function ImageComp({ content }) {
  const postContext = useContext(PostsContextData);
  const load = postContext.isLoaded;

  const [dimensions, setDimensions] = useState({
    width: content.width,
    height: content.height,
  });

  useEffect(() => {
    const getImageHeight = async () => {
      const img = await getMeta(content.src);
      setDimensions({
        width: img.width,
        height: img.height,
      });
    };
    if (!content.width || !content.height) {
      getImageHeight();
    }
  }, [content.height, content.src, content.width]);

  if (!dimensions.width || !dimensions.height) return null;

  let finalWidth = dimensions.width;
  let finalHeight = dimensions.height;

  // limit the height of images
  const maxHeight = 625;
  if (finalHeight > maxHeight) {
    finalWidth = (finalWidth * maxHeight) / finalHeight;
    finalHeight = maxHeight;
  }

  const width =
    finalHeight > 800 ? (finalWidth * 800) / finalHeight : finalWidth;
  const contStyle = { width: `${width}px` };
  const ratio = (finalHeight / finalWidth) * 100;
  const ratioStyle = { paddingBottom: `${ratio}%` };
  let imgClass = '';
  if (content.class) {
    imgClass += ` ${content.class}`;
  }

  const title = load === true ? content.title : 'placeholder';

  return (
    <div className="ratio-bg media-cont">
      <div style={contStyle} className="ratio-container">
        <div style={ratioStyle} className="ratio embed-responsive loading-icon">
          {load && <img src={content.src} alt={title} className={imgClass} />}
        </div>
      </div>
    </div>
  );
}

ImageComp.propTypes = {
  content: PropTypes.object.isRequired,
};

export default ImageComp;
