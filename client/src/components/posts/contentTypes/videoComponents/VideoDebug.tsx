import { memo, Suspense, useState } from 'react';
import { Button } from 'react-bootstrap';
import JsonView from 'react18-json-view';
import 'react18-json-view/src/style.css';
import 'react18-json-view/src/dark.css';
import type { BufferData, VideoDiagnosticInfo } from './types';

interface VideoDebugProps {
  currentTime: number;
  duration: number;
  canPlay: boolean;
  canPlayThrough: boolean;
  stalled: boolean;
  waiting: boolean;
  buffer: BufferData;
  diagnosticInfo: VideoDiagnosticInfo | string;
}

function VideoDebug({
  currentTime,
  duration,
  canPlay,
  canPlayThrough,
  stalled,
  waiting,
  buffer,
  diagnosticInfo,
}: VideoDebugProps) {
  const [showDebug, setShowDebug] = useState(false);

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  const videoState = {
    currentTime,
    duration,
    canPlay,
    canPlayThrough,
    stalled,
    waiting,
    bufferStatus: buffer.status,
    buffers: buffer.buffers,
  };

  return (
    <div>
      <div>
        <Button
          className="m-0 p-0 shadow-none"
          size="sm"
          variant="link"
          onClick={toggleDebug}
        >
          {showDebug ? 'Hide' : 'Show'} Video Debug
        </Button>
      </div>
      {showDebug && (
        <div className="debug">
          <Suspense fallback={<div>Loading Debug Info...</div>}>
            <div className="code-block rounded">
              <h6>Video State</h6>
              <JsonView dark src={videoState} theme="atom" />
            </div>
            <div className="code-block rounded">
              <h6>Diagnostics</h6>
              {typeof diagnosticInfo === 'string' ? (
                <code>{diagnosticInfo}</code>
              ) : (
                <JsonView dark src={diagnosticInfo} theme="atom" />
              )}
            </div>
          </Suspense>
        </div>
      )}
    </div>
  );
}

export default memo(VideoDebug);
