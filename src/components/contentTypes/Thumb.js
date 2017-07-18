import React from 'react';
import PropTypes from 'prop-types';

const Thumb = ({ content, load }) => {
  let img;
  if (load) {
    img = (<img
      src={content.thumbnail}
      data-orig={content.thumbnail}
      alt={content.title}
      className="loaded reddit-thumb preload"
    />);
  } else {
    img = (<img
      src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      data-orig={content.thumbnail}
      alt={content.title}
      className="unloaded reddit-thumb"
    />);
  }

  return (
    <div>
      <a href={content.url} target="_blank" rel="noopener noreferrer">{img}</a>
      <div className="no-embed">Embed not available. Click to view on {content.domain}</div>
    </div>);
};

Thumb.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default Thumb;
