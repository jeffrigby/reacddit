import { memo, useRef } from 'react';
import type { BufferData } from './types';

interface VideoBufferBarProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  buffers: BufferData;
  duration: number;
  currentTime: number;
}

function VideoBufferBar({
  videoRef,
  buffers,
  currentTime,
  duration,
}: VideoBufferBarProps) {
  const seek = (time: number) => {
    if (videoRef.current) {
      // eslint-disable-next-line no-param-reassign
      videoRef.current.currentTime = time;
    }
  };

  const seekBar = useRef<HTMLDivElement>(null);

  const triggerSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // where is this progress bar on the page:
    const percent =
      (e.pageX - e.currentTarget.getBoundingClientRect().left) /
      e.currentTarget.offsetWidth;
    const seekTime = percent * duration;
    seek(seekTime);
  };

  const bars = [];

  // Figure out buffer bars
  if (buffers.buffers.length === 0 || buffers.status === 'full') {
    bars.push(<div className="buffer-bar buffer-bar-full" key="buffer-full" />);
  } else {
    buffers.buffers.forEach((val, idx) => {
      const style = {
        left: `${val.marginLeft}%`,
        right: `${val.marginRight}%`,
      };
      bars.push(
        <div className="buffer-bar" key={`buffer-${val.range}`} style={style} />
      );
    });
  }

  // Figure out duration
  const progressMarginRight = 100 - (currentTime / duration) * 100;
  const progressBarStyle = {
    right: `${progressMarginRight}%`,
  };

  return (
    <div className="video-bar-cont">
      <div
        className="seek-bar"
        ref={seekBar}
        role="presentation"
        onClick={triggerSeek}
      />
      {bars}
      <div className="progress-bar" style={progressBarStyle} />
    </div>
  );
}

export default memo(VideoBufferBar);
