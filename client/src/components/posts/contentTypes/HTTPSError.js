import React from 'react';
import PropTypes from 'prop-types';

const HTTPSError = ({ content, load }) => (
  <div className="self">
    <p>
      <i className="fas fa-exclamation-circle" /> Link is not HTTPS. Click{' '}
      <a href={content.src} target="_blank" rel="noreferrer">
        here
      </a>{' '}
      to load the link in a new window.
    </p>
  </div>
);

HTTPSError.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default HTTPSError;
