import PropTypes from 'prop-types';

function HTTPSError({ content }) {
  const { src } = content;
  return (
    <div className="self">
      <p>
        <i className="fas fa-exclamation-circle" /> Link is not HTTPS. Click{' '}
        <a href={src} target="_blank" rel="noreferrer">
          here
        </a>{' '}
        to load the link in a new window.
      </p>
    </div>
  );
}

HTTPSError.propTypes = {
  content: PropTypes.object.isRequired,
};

export default HTTPSError;
