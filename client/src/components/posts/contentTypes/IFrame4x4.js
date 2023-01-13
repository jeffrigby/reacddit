import { useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

function IFrame4x4({ content }) {
  const postContext = useContext(PostsContextData);
  const { isLoaded } = postContext;
  return (
    <div className="media-cont">
      <div className="embed-container media-cont">
        {isLoaded && (
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
}

IFrame4x4.propTypes = {
  content: PropTypes.object.isRequired,
};

export default IFrame4x4;
