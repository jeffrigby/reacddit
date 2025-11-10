import { memo, type RefObject } from 'react';

interface VideoLoadErrorProps {
  videoRef: RefObject<HTMLVideoElement>;
  link?: string;
  showLoadError: boolean;
  canPlay: boolean;
}

function VideoLoadError({
  videoRef,
  link,
  showLoadError,
  canPlay,
}: VideoLoadErrorProps) {
  // Don't render if not in error state
  if (!showLoadError || canPlay) {
    return null;
  }

  const getErrorMessage = (): string => {
    if (!videoRef.current) {
      return 'This is taking longer than it should.';
    }

    const video = videoRef.current;

    // Check for explicit video errors
    if (video.error) {
      return 'Unable to load this video. The video format may not be supported.';
    }

    // Check if browser refused to load the source
    if (video.networkState === 3) {
      // NETWORK_NO_SOURCE
      return 'Unable to load the video source. Your browser may not support this format.';
    }

    // Default timeout message
    return 'This is taking longer than it should.';
  };

  const directLink = link ? (
    <a href={link} rel="noopener noreferrer" target="_blank">
      Open in new tab.
    </a>
  ) : null;

  return (
    <div className="slow-loading">
      {getErrorMessage()} You can try to load the video directly.
      <br />
      {directLink}
    </div>
  );
}

export default memo(VideoLoadError);
