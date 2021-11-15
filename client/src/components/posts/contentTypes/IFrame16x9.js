import { useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

function IFrame16x9({ content }) {
  const postContext = useContext(PostsContextData);
  const load = postContext.isLoaded;
  return (
    <div className="media-cont black-bg">
      <div className="media-contain-width">
        <div className="ratio ratio-16x9 black-bg">
          {load && (
            <iframe
              src={content.src}
              scrolling="no"
              title={content.name}
              allow={content.allow}
              className="loading-icon"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </div>
  );
}

IFrame16x9.propTypes = {
  content: PropTypes.object.isRequired,
};

export default IFrame16x9;
