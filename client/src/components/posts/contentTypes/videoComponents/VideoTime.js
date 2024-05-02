import { memo } from 'react';
import PropTypes from 'prop-types';

function convertSeconds(secs) {
  const seconds = Math.round(secs);

  const results = {};
  results.hours = Math.floor(seconds / 60 / 60);
  results.minutes = Math.floor((seconds / 60) % 60)
    .toString()
    .padStart(2, '0');
  results.seconds = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');

  let timestamp = '';
  if (results.hours > 0) {
    timestamp += `${results.hours}:`;
  }

  timestamp += `${results.minutes}:${results.seconds}`;

  return timestamp;
}

function VideoTime({ currentTime, duration }) {
  // Figure out the times
  const durationPretty = convertSeconds(duration);
  const currentTimePretty = currentTime ? convertSeconds(currentTime) : '00:00';

  return (
    <div className="video-time flex-nowrap">
      {currentTimePretty} / {durationPretty}
    </div>
  );
}

VideoTime.propTypes = {
  currentTime: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
};

export default memo(VideoTime);
