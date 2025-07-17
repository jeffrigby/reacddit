import type { MouseEvent } from 'react';
import { memo, useState } from 'react';
import type { BufferData } from './types';

interface VideoDebugProps {
  currentTime: number;
  duration: number;
  canPlay: boolean;
  canPlayThrough: boolean;
  stalled: boolean;
  waiting: boolean;
  buffer: BufferData;
}

function VideoDebug({
  currentTime,
  duration,
  canPlay,
  canPlayThrough,
  stalled,
  waiting,
  buffer,
}: VideoDebugProps) {
  const [showDebug, setShowDebug] = useState(false);

  const toggleDebug = (event: MouseEvent<HTMLButtonElement>) => {
    setShowDebug(!showDebug);
  };

  return (
    <div>
      <div>
        <button
          className="btn btn-link btn-sm m-0 p-0 shadow-none"
          type="button"
          onClick={toggleDebug}
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

export default memo(VideoDebug);
