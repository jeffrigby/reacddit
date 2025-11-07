import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchSubredditsLastUpdated,
  lastUpdatedCleared,
  selectLastUpdatedTime,
  selectLastUpdatedProgress,
  selectLastUpdatedRunning,
  selectLastUpdatedError,
} from '@/redux/slices/subredditPollingSlice';
import { formatRelativeTime } from '@/common';

function SyncStatus() {
  const [expanded, setExpanded] = useState(false);
  const dispatch = useAppDispatch();

  const lastUpdatedTime = useAppSelector(selectLastUpdatedTime);
  const progress = useAppSelector(selectLastUpdatedProgress);
  const isRunning = useAppSelector(selectLastUpdatedRunning);
  const error = useAppSelector(selectLastUpdatedError);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleSync = () => {
    dispatch(fetchSubredditsLastUpdated());
  };

  const handleClearCache = () => {
    dispatch(lastUpdatedCleared());
    dispatch(fetchSubredditsLastUpdated());
  };

  // Format status text
  let statusText: string;
  let statusIcon: React.ReactElement;

  if (isRunning && progress) {
    statusText = `Checking: ${progress.completed}/${progress.total}`;
    statusIcon = <FontAwesomeIcon spin icon={faSpinner} />;
  } else if (lastUpdatedTime > 0) {
    statusText = `Last check: ${formatRelativeTime(lastUpdatedTime)}`;
    statusIcon = <FontAwesomeIcon icon={faCheckCircle} />;
  } else {
    statusText = 'Not checked';
    statusIcon = <FontAwesomeIcon icon={faCheckCircle} />;
  }

  // Format full timestamp for expanded view
  const fullTimestamp = lastUpdatedTime
    ? new Date(lastUpdatedTime).toLocaleString()
    : 'Never';

  return (
    <div className="px-3 py-2 mt-2 border-top border-secondary text-muted small">
      <div
        className="user-select-none"
        role="button"
        style={{ cursor: 'pointer' }}
        tabIndex={0}
        onClick={handleToggleExpanded}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleExpanded();
          }
        }}
      >
        <span className="me-1">{statusIcon}</span>
        {statusText}
      </div>

      {expanded && (
        <div className="mt-2 p-2 bg-dark rounded" style={{ fontSize: '10px' }}>
          <div
            className="mb-2 text-muted fst-italic"
            style={{ fontSize: '9px' }}
          >
            Checks each subreddit for new posts to show activity indicators
          </div>
          <div className="mb-2">
            <strong>Last check:</strong> {fullTimestamp}
          </div>

          {progress && (
            <div className="mb-2">
              <strong>Progress:</strong>
              <div
                className="progress mt-1 position-relative"
                style={{ height: '14px' }}
              >
                <div
                  aria-valuemax={progress.total}
                  aria-valuemin={0}
                  aria-valuenow={progress.completed}
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${(progress.completed / progress.total) * 100}%`,
                  }}
                />
                <small
                  className="position-absolute w-100 text-center"
                  style={{ top: '0', left: '0', lineHeight: '14px' }}
                >
                  {progress.completed} / {progress.total}
                </small>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-2 text-danger">
              <FontAwesomeIcon icon={faExclamationTriangle} /> {error}
            </div>
          )}

          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-primary"
              disabled={isRunning}
              type="button"
              onClick={handleSync}
            >
              <small>Sync</small>
            </button>
            <button
              className="btn btn-sm btn-secondary"
              disabled={isRunning}
              type="button"
              onClick={handleClearCache}
            >
              <small>Clear Cache</small>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SyncStatus;
