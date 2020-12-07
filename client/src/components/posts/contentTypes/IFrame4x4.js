import React from 'react';
import PropTypes from 'prop-types';

const IFrame4x4 = ({ content, load }) => (
  <div className="media-cont">
    <div className="embed-container media-cont">
      {load && (
        <iframe
          src={content.src}
          scrolling="no"
          title={content.name}
          className="iframe_4x4 loading-icon"
          allowFullScreen
        />
      )}
    </div>
  </div>
);

IFrame4x4.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default IFrame4x4;
