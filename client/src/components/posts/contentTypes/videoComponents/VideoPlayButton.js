import React from 'react';
import PropTypes from 'prop-types';

const VideoPlayButton = ({ videoRef, playing }) => {
  const playIconClass = `fas ${playing ? 'fa-pause' : 'fa-play'}`;
  const playTitle = playing ? 'Pause' : 'Play';

  const playStop = () => {
    // eslint-disable-next-line no-unused-expressions
    videoRef.current.paused
      ? videoRef.current.play()
      : videoRef.current.pause();
  };

  return (
    <button
      type="button"
      className="btn btn-link shadow-none mx-4 p-0 btn-sm"
      onClick={playStop}
      title={playTitle}
    >
      <i className={playIconClass} />
    </button>
  );
};

VideoPlayButton.propTypes = {
  videoRef: PropTypes.object.isRequired,
  playing: PropTypes.bool.isRequired,
};

VideoPlayButton.defaultProps = {};

export default React.memo(VideoPlayButton);
