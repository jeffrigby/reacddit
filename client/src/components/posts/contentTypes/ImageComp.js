import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

function getMeta(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

const ImageComp = ({ content, load }) => {
  const contentRender = content;
  const [dimensions, setDimensions] = useState({
    width: contentRender.width,
    height: contentRender.height,
  });

  useEffect(() => {
    const getImageHeight = async () => {
      const img = await getMeta(contentRender.src);
      setDimensions({
        width: img.width,
        height: img.height,
      });
    };
    if (!contentRender.width || !contentRender.height) {
      getImageHeight();
    }
  }, [contentRender.height, contentRender.src, contentRender.width]);

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
  let imgClass = 'embed-responsive-item';
  if (contentRender.class) {
    imgClass += ` ${contentRender.class}`;
  }

  const title = load === true ? contentRender.title : 'placeholder';

  return (
    <div className="ratio-bg media-cont">
      <div style={contStyle} className="ratio-container">
        <div style={ratioStyle} className="ratio embed-responsive loading-icon">
          {load && (
            <img src={contentRender.src} alt={title} className={imgClass} />
          )}
        </div>
      </div>
    </div>
  );
};

ImageComp.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default ImageComp;
