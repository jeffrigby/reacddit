import React, { useState } from 'react';
import PropTypes from 'prop-types';

const VideoComp = ({ content, load }) => {
  const videoRef = React.createRef();
  const [muted, setMuted] = useState(true);

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

  const toggleSound = () => {
    if (videoRef.current.muted) {
      videoRef.current.muted = false;
      setMuted(false);
    } else {
      videoRef.current.muted = true;
      setMuted(true);
    }
  };

  const playStop = elm => {
    if (elm.target.paused) {
      elm.target.play();
    } else {
      elm.target.pause();
    }
    // elm.target.paused ? elm.target.play() : elm.target.pause();
  };

  const mutedIconClass = `fas ${
    muted ? 'fas fa-volume-up' : 'fas fa-volume-mute'
  }`;

  const muteTitle = muted ? 'Play Sound' : 'Mute';

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
        id={videoId}
        key={videoId}
        poster={content.thumb}
        className="loaded embed-responsive-item preload"
        onClick={playStop}
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

  return (
    <div className={`video-container${muted ? ' muted' : ' unmuted'}`}>
      <div className="ratio-bg">
        <div style={contStyle} className="ratio-container">
          <div style={ratioStyle} className="ratio embed-responsive">
            {video}
          </div>
        </div>
      </div>
      {content.hasAudio && (
        <div className="video-audio">
          <button
            type="button"
            className="btn btn-link menu-link m-0 p-0 btn-lg"
            onClick={toggleSound}
            title={muteTitle}
            disabled={content.audioWarning}
          >
            <i className={mutedIconClass} />
          </button>
          {content.audioWarning && (
            <div
              className="audio-disabled bg-light border border-dark p-1"
              role="tooltip"
            >
              This video might have audio but Reddit disables audio on
              third-party sites. Click the link to load the video source.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

VideoComp.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default VideoComp;
