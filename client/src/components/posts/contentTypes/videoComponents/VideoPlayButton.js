import { memo } from 'react';
import PropTypes from 'prop-types';

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
      type="button"
      className="btn btn-link shadow-none mx-4 p-0 btn-sm"
      onClick={playStop}
      title={playTitle}
      aria-label={playTitle}
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
