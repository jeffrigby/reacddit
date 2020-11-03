import React from 'react';
import PropTypes from 'prop-types';

const VideoDebug = ({
  currentTime,
  duration,
  canPlay,
  canPlayThrough,
  stalled,
  waiting,
  buffer,
}) => {
  return (
    <code>
      Current Time: {currentTime}
      <br />
      Duration: {duration}
      <br />
      Can Play: {canPlay ? 'true' : 'false'}
      <br />
      Can Play Through: {canPlayThrough ? 'true' : 'false'}
      <br />
      Stalled: {stalled ? 'true' : 'false'}
      <br />
      Waiting: {waiting ? 'true' : 'false'}
      <br />
      Buffer Status: {buffer.status}
      <br />
      Buffers: {JSON.stringify(buffer.buffers)}
    </code>
  );
};

VideoDebug.propTypes = {
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  canPlay: PropTypes.bool.isRequired,
  canPlayThrough: PropTypes.bool.isRequired,
  stalled: PropTypes.bool.isRequired,
  waiting: PropTypes.bool.isRequired,
  buffer: PropTypes.object.isRequired,
};

export default React.memo(VideoDebug);
