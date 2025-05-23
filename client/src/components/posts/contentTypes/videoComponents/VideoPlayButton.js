import { memo } from 'react';
import PropTypes from 'prop-types';

/**
 * Renders a video play button.
 * @param {Object} props - The properties object.
 * @param {React.Ref} props.videoRef - The video reference.
 * @param {boolean} props.playing - Indicates whether the video is currently playing.
 * @param {Function} props.toggleManualStop - Callback function to toggle manual stop.
 * @returns {JSX.Element} - The video play button component.
 * @constructor
 */
function VideoPlayButton({ videoRef, playing, toggleManualStop }) {
  const playIconClass = `fas ${playing ? 'fa-pause' : 'fa-play'}`;
  const playTitle = playing ? 'Pause' : 'Play';

  const playStop = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      toggleManualStop(false);
    } else {
      videoRef.current.pause();
      toggleManualStop(true);
    }
  };

  return (
    <button
      aria-label={playTitle}
      className="btn btn-link shadow-none mx-4 p-0 btn-sm"
      title={playTitle}
      type="button"
      onClick={playStop}
    >
      <i className={playIconClass} />
    </button>
  );
}

VideoPlayButton.propTypes = {
  videoRef: PropTypes.object.isRequired,
  playing: PropTypes.bool.isRequired,
  toggleManualStop: PropTypes.func.isRequired,
};

export default memo(VideoPlayButton);
