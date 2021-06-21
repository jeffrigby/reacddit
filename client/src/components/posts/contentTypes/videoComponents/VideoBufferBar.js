import { memo, useRef } from 'react';
import PropTypes from 'prop-types';

function VideoBufferBar({ videoRef, buffers, currentTime, duration }) {
  const seek = (time) => {
    if (videoRef.current) {
      // eslint-disable-next-line no-param-reassign
      videoRef.current.currentTime = time;
    }
  };

  const seekBar = useRef();

  const triggerSeek = (e) => {
    e.preventDefault();
    // where is this progress bar on the page:
    const percent =
      (e.pageX - e.target.getBoundingClientRect().left) / e.target.offsetWidth;
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
        onClick={triggerSeek}
        role="presentation"
      />
      {bars}
      <div className="progress-bar" style={progressBarStyle} />
    </div>
  );
}

VideoBufferBar.propTypes = {
  videoRef: PropTypes.object.isRequired,
  buffers: PropTypes.object.isRequired,
  duration: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default memo(VideoBufferBar);
