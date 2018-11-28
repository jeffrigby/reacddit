import React from 'react';
import PropTypes from 'prop-types';

const IFrame16x9 = ({ content, load }) => {
  const src = load ? content.src : 'about:blank';
  return (
    <div className="embed-responsive embed-responsive-16by9 black-bg">
      <iframe
        src={src}
        scrolling="no"
        title={content.name}
        className="embed-responsive-item"
        allowFullScreen
      />
    </div>
  );
};

IFrame16x9.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default IFrame16x9;
