import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../../styles/video.scss';

const VideoComp = ({ content, load }) => {
  const videoRef = React.createRef();
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [ctrLock, setCtrLock] = useState(false);
  const [controls, setControls] = useState(false);

  const { width, height, sources } = content;
  let videoWidth = width;
  let videoHeight = height;

  // Size down if needed
  const maxHeight = 625;
  if (height > maxHeight) {
    videoWidth = (width * maxHeight) / height;
    videoHeight = maxHeight;
  }

  const finalWidth =
    videoHeight > 800 ? (videoWidth * 800) / videoHeight : videoWidth;
  const contStyle = { width: `${finalWidth}px` };
  const ratio = (videoHeight / videoWidth) * 100;
  const ratioStyle = { paddingBottom: `${ratio}%` };
  const videoId = `video-${content.id}`;

  const toggleLock = () => {
    if (ctrLock) {
      setCtrLock(false);
    } else {
      setCtrLock(true);
    }
  };

  const toggleSound = () => {
    if (videoRef.current.muted) {
      videoRef.current.muted = false;
      setMuted(false);
    } else {
      videoRef.current.muted = true;
      setMuted(true);
    }
  };

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

  const playStop = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  // const timeUpdate = () => {
  //   const { currentTime, duration } = videoRef.current;
  //   scrubberRef.current.value = (currentTime / duration) * 100;
  // };

  const playIconClass = `fas ${playing ? 'fa-pause' : 'fa-play'}`;
  const mutedIconClass = `fas ${muted ? 'fa-volume-up' : 'fa-volume-mute'}`;

  const muteTitle = muted ? 'Play Sound' : 'Mute';
  const playTitle = playing ? 'Pause' : 'Play';

  // load = false;
  let video;
  if (load === true) {
    const videoSources = sources.map((source, idx) => {
      const key = `${videoId}-${idx}`;
      return <source src={source.src} type={source.type} key={key} />;
    });

    video = (
      <video
        autoPlay
        loop
        muted
        playsInline
        controls={controls}
        id={videoId}
        key={videoId}
        onClick={toggleLock}
        poster={content.thumb}
        className="loaded embed-responsive-item preload"
        // onClick={toggleControls}
        // onTimeUpdate={timeUpdate}
        ref={videoRef}
      >
        {videoSources}
      </video>
    );
  } else {
    // replace with thumb if loading is too slow.
    video = (
      <img
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        className="embed-responsive-item"
        alt={content.id}
      />
    );
  }

  const videoContainerClass = [
    'video-container',
    muted ? 'muted' : 'unmuted',
    playing ? 'playing' : 'paused',
    ctrLock ? 'locked' : 'unlocked',
  ];

  const btnClasses = 'btn btn-link m-0 py-0 px-1 btn-md video-ctr';
  return (
    <div className={videoContainerClass.join(' ')}>
      <div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
          <div style={ratioStyle} className="ratio embed-responsive">
            {video}
          </div>
        </div>
      </div>
      <div className="video-controls m-0 p-0">
        <button
          type="button"
          className={`${btnClasses} ${
            controls ? 'ctrl-visible' : 'ctrl-hidden'
          } video-controls-toggle`}
          onClick={() => setControls(!controls)}
          title="Toggle Browser Video Controls"
        >
          <i className="fas fa-sliders-h" />
        </button>
        <button
          type="button"
          className={`${btnClasses} video-fullscreen`}
          onClick={toggleFullscreen}
          title="Full Screen"
        >
          <i className="fas fa-expand" />
        </button>
        <button
          type="button"
          className={`${btnClasses} video-play`}
          onClick={playStop}
          title={playTitle}
        >
          <i className={playIconClass} />
        </button>
        {content.hasAudio && (
          <span className="video-audio-cont">
            <button
              type="button"
              className={`${btnClasses} video-audio`}
              onClick={toggleSound}
              title={muteTitle}
              // disabled={content.audioWarning}
            >
              <i className={mutedIconClass} />
            </button>
            {content.audioWarning && (
              <div
                className="audio-disabled bg-dark border border-light p-1"
                role="tooltip"
              >
                This video probably has audio but Reddit disables it on
                third-party sites. Click the link to load the video source.
              </div>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

VideoComp.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default VideoComp;
