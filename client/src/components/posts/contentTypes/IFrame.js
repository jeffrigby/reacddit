import { useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

const IFrame = ({
  content: {
    src,
    width = 16,
    height = 9,
    allow = 'fullscreen',
    sandbox = 'allow-scripts allow-same-origin',
    referrerPolicy = 'no-referrer-when-downgrade',
    loading = 'lazy',
    iframeStyle = {},
    onLoad = () => {},
  },
}) => {
  const postContext = useContext(PostsContextData);
  const { title } = postContext.post.data;

  const style = {};

  // Default aspect ratio is 16:9
  style.aspectRatio = `${width}/${height}`;

  const { isLoaded } = postContext;

  return (
    <div className="media-cont black-bg">
      <div className="media-ratio" style={style}>
        {isLoaded && (
          <iframe
            allowFullScreen
            allow={allow}
            className="loading-icon"
            loading={loading}
            referrerPolicy={referrerPolicy}
            sandbox={sandbox}
            scrolling="no"
            src={src}
            style={iframeStyle}
            title={title}
            onLoad={onLoad}
          />
        )}
      </div>
    </div>
  );
};

IFrame.propTypes = {
  content: PropTypes.shape({
    src: PropTypes.string.isRequired,
    width: PropTypes.number,
    height: PropTypes.number,
    allow: PropTypes.string,
    sandbox: PropTypes.string,
    referrerPolicy: PropTypes.string,
    loading: PropTypes.string,
    iframeStyle: PropTypes.object,
    className: PropTypes.string,
    onLoad: PropTypes.func,
  }).isRequired,
};

export default IFrame;
