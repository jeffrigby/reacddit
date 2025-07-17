import { memo } from 'react';
import VideoAudioButton from './VideoAudioButton';
import VideoFullScreenButton from './VideoFullScreenButton';
import VideoPlayButton from './VideoPlayButton';
import VideoTime from './VideoTime';
import VideoBufferBar from './VideoBufferBar';
import type { VideoContent, BufferData } from './types';

interface VideoControlBarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  currentTime: number;
  playing: boolean;
  muted: boolean;
  content: VideoContent;
  link?: string;
  buffer: BufferData;
  toggleManualStop: (stopped: boolean) => void;
}

function VideoControlBar({
  videoRef,
  duration,
  currentTime,
  playing,
  muted,
  content,
  link = '',
  buffer,
  toggleManualStop,
}: VideoControlBarProps) {
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
}

export default memo(VideoControlBar);
