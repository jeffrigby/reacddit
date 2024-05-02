import { useContext } from 'react';
import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

function IFrame({
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
}) {
  const postContext = useContext(PostsContextData);
  const { title } = postContext.post.data;

  const style = {};

  // Default aspect ratio is 16:9
  style.aspectRatio = `${width}/${height}`;

  const { isLoaded } = postContext;

  return (
    <div className="media-cont black-bg">
      <div className="iframe-ratio" style={style}>
        {isLoaded && (
          <iframe
            src={src}
            title={title}
            className="loading-icon"
            allowFullScreen
            allow={allow}
            sandbox={sandbox}
            referrerPolicy={referrerPolicy}
            loading={loading}
            style={iframeStyle}
            onLoad={onLoad}
          />
        )}
      </div>
    </div>
  );
}

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
