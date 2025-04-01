import { memo } from 'react';
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
  if (!duration) {
    return null;
  }

  return (
    <>
      <div className="video-bottom-control-cont">
        <div className="video-actions d-flex px-2">
          <VideoPlayButton
            playing={playing}
            toggleManualStop={toggleManualStop}
            videoRef={videoRef}
          />
          <VideoTime currentTime={currentTime} duration={duration} />
          <VideoAudioButton
            audioWarning={content.audioWarning}
            btnClasses="btn btn-link mx-4 p-0 btn-sm"
            hasAudio={content.hasAudio}
            link={link}
            muted={muted}
            videoRef={videoRef}
          />
          <div className="ms-auto">
            <VideoFullScreenButton videoRef={videoRef} />
          </div>
        </div>
      </div>
      <VideoBufferBar
        buffers={buffer}
        currentTime={currentTime}
        duration={duration}
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

export default memo(VideoControlBar);
