import { useContext } from 'react';
// import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

function HTTPSError() {
  const postContext = useContext(PostsContextData);
  const { content } = postContext;
  return (
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
}

HTTPSError.propTypes = {};

export default HTTPSError;
