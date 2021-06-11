import React from 'react';
import PropTypes from 'prop-types';
import VideoAudioButton from './VideoAudioButton';
import VideoFullScreenButton from './VideoFullScreenButton';
import VideoPlayButton from './VideoPlayButton';
import VideoTime from './VideoTime';
import VideoBufferBar from './VideoBufferBar';

const VideoControlBar = ({
  videoRef,
  duration,
  currentTime,
  playing,
  muted,
  content,
  link,
  buffer,
  toggleManualStop,
}) => {
  if (!duration) return <></>;

  return (
    <>
      <div className="video-bottom-control-cont">
        <div className="video-actions d-flex px-2">
          <VideoPlayButton
            videoRef={videoRef}
            playing={playing}
            toggleManualStop={toggleManualStop}
          />
          <VideoTime duration={duration} currentTime={currentTime} />
          <VideoAudioButton
            link={link}
            videoRef={videoRef}
            audioWarning={content.audioWarning}
            hasAudio={content.hasAudio}
            muted={muted}
            btnClasses="btn btn-link mx-4 p-0 btn-sm"
          />
          <div className="ml-auto">
            <VideoFullScreenButton videoRef={videoRef} />
          </div>
        </div>
      </div>
      <VideoBufferBar
        buffers={buffer}
        duration={duration}
        currentTime={currentTime}
        videoRef={videoRef}
      />
    </>
  );
};

VideoControlBar.propTypes = {
  videoRef: PropTypes.object.isRequired,
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  playing: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
  content: PropTypes.object.isRequired,
  link: PropTypes.string,
  buffer: PropTypes.object.isRequired,
  toggleManualStop: PropTypes.func.isRequired,
};

VideoControlBar.defaultProps = {
  link: '',
};

export default React.memo(VideoControlBar);
