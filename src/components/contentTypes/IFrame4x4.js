import React from 'react';
import PropTypes from 'prop-types';

const IFrame4x4 = ({ content, load }) => {
  const src = load ? content.src : 'about:blank';
  return (<div className="embed-container">
    <iframe src={src} scrolling="no" title={content.name} className="iframe_4x4" allowFullScreen />
  </div>);
};

IFrame4x4.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default IFrame4x4;
