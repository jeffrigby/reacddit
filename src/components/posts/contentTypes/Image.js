import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ content, load }) => {
  const contentRender = content;
  // limit the height of images
  const maxHeight = 625;
  if (contentRender.height > maxHeight) {
    contentRender.width =
      (contentRender.width * maxHeight) / contentRender.height;
    contentRender.height = maxHeight;
  }

  const width =
    contentRender.height > 800
      ? (contentRender.width * 800) / contentRender.height
      : contentRender.width;
  const contStyle = { width: `${width}px` };
  const ratio = (contentRender.height / contentRender.width) * 100;
  const ratioStyle = { paddingBottom: `${ratio}%` };
  let imgClass = 'embed-responsive-item';
  if (contentRender.class) {
    imgClass += ` ${contentRender.class}`;
  }

  const src =
    load === true
      ? contentRender.src
      : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  return (
    <div className="ratio-bg">
      <div style={contStyle} className="ratio-container">
        <div style={ratioStyle} className="ratio embed-responsive">
          <img src={src} alt={contentRender.title} className={imgClass} />
        </div>
      </div>
    </div>
  );
};

Image.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default Image;
