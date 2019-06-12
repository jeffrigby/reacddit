import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const VideoProgreeBar = ({ videoRef }) => {
  const [progress, setProgress] = useState(0);

  const videoProgressRef = React.createRef();

  useEffect(() => {
    const updateProgressBar = () => {
      const currentVideo = videoRef.current;
      if (!currentVideo) return;

      const current = Math.floor(
        (100 / videoRef.current.duration) * videoRef.current.currentTime
      );
      setProgress(current);
    };

    const currentVideo = videoRef.current;
    if (currentVideo) {
      currentVideo.addEventListener('timeupdate', updateProgressBar);
    }
    return () => {
      if (currentVideo) {
        currentVideo.removeEventListener('timeupdate', updateProgressBar);
      }
    };
  }, [videoRef]);

  const seek = e => {
    // where is this progress bar on the page:
    const percent =
      (e.pageX - e.target.getBoundingClientRect().left) / e.target.offsetWidth;
    videoRef.current.currentTime = percent * videoRef.current.duration; // eslint-disable-line no-param-reassign
  };

  return (
    <progress
      className="video-progress-bar m-0 p-0"
      ref={videoProgressRef}
      max="100"
      value={progress}
      onClick={seek}
      role="presentation"
    />
  );
};

VideoProgreeBar.propTypes = {
  videoRef: PropTypes.object.isRequired,
};

export default VideoProgreeBar;
