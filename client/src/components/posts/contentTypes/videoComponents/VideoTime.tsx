import { memo } from 'react';

interface TimeResult {
  hours: number;
  minutes: string;
  seconds: string;
}

function convertSeconds(secs: number): string {
  const seconds = Math.round(secs);

  const results: TimeResult = {
    hours: Math.floor(seconds / 60 / 60),
    minutes: Math.floor((seconds / 60) % 60)
      .toString()
      .padStart(2, '0'),
    seconds: Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0'),
  };

  let timestamp = '';
  if (results.hours > 0) {
    timestamp += `${results.hours}:`;
  }

  timestamp += `${results.minutes}:${results.seconds}`;

  return timestamp;
}

interface VideoTimeProps {
  currentTime: number;
  duration: number;
}

function VideoTime({ currentTime, duration }: VideoTimeProps) {
  const durationPretty = convertSeconds(duration);
  const currentTimePretty = currentTime ? convertSeconds(currentTime) : '00:00';

  return (
    <div className="video-time flex-nowrap">
      {currentTimePretty} / {durationPretty}
    </div>
  );
}

export default memo(VideoTime);
