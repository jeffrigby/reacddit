import { memo, useState } from 'react';
import PropTypes from 'prop-types';

function VideoDebug({
  currentTime,
  duration,
  canPlay,
  canPlayThrough,
  stalled,
  waiting,
  buffer,
}) {
  const [showDebug, setShowDebug] = useState(false);
  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  return (
    <div>
      <div>
        <button
          onClick={toggleDebug}
          type="button"
          className="btn btn-link btn-sm m-0 p-0 shadow-none"
        >
          {showDebug ? 'Hide' : 'Show'} Video Debug
        </button>
      </div>
      {showDebug && (
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
      )}
    </div>
  );
}

VideoDebug.propTypes = {
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  canPlay: PropTypes.bool.isRequired,
  canPlayThrough: PropTypes.bool.isRequired,
  stalled: PropTypes.bool.isRequired,
  waiting: PropTypes.bool.isRequired,
  buffer: PropTypes.object.isRequired,
};

export default memo(VideoDebug);
