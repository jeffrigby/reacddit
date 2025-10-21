import { memo, useRef, useMemo } from 'react';
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
    const percent =
      (e.pageX - e.currentTarget.getBoundingClientRect().left) /
      e.currentTarget.offsetWidth;
    const seekTime = percent * duration;
    seek(seekTime);
  };

  const bars = useMemo(() => {
    if (buffers.buffers.length === 0 || buffers.status === 'full') {
      return [<div className="buffer-bar buffer-bar-full" key="buffer-full" />];
    }

    return buffers.buffers.map((val) => {
      const style = {
        left: `${val.marginLeft}%`,
        right: `${val.marginRight}%`,
      };
      return (
        <div className="buffer-bar" key={`buffer-${val.range}`} style={style} />
      );
    });
  }, [buffers.buffers, buffers.status]);

  const progressBarStyle = useMemo(() => {
    const progressMarginRight = 100 - (currentTime / duration) * 100;
    return {
      right: `${progressMarginRight}%`,
    };
  }, [currentTime, duration]);

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
