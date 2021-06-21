import { memo } from 'react';
import PropTypes from 'prop-types';

const VideoFullScreenButton = ({ videoRef }) => {
  /**
   * Toggle full screen
   */
  const toggleFullscreen = () => {
    if (videoRef.current.requestFullScreen) {
      videoRef.current.requestFullScreen();
    } else if (videoRef.current.webkitRequestFullScreen) {
      videoRef.current.webkitRequestFullScreen();
    } else if (videoRef.current.mozRequestFullScreen) {
      videoRef.current.mozRequestFullScreen();
    } else if (videoRef.current.webkitEnterFullscreen) {
      videoRef.current.webkitEnterFullscreen();
    }
  };

  return (
    <button
      type="button"
      className="btn btn-link shadow-none mx-4 p-0 btn-sm"
      onClick={toggleFullscreen}
      title="Full Screen"
    >
      <i className="fas fa-expand" />
    </button>
  );
};

VideoFullScreenButton.propTypes = {
  videoRef: PropTypes.object.isRequired,
};

VideoFullScreenButton.defaultProps = {};

export default memo(VideoFullScreenButton);
