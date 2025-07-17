import { memo, type MouseEvent } from 'react';
import type { ExtendedHTMLVideoElement } from './types';

interface VideoFullScreenButtonProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

function VideoFullScreenButton({ videoRef }: VideoFullScreenButtonProps) {
  /**
   * Toggle full screen
   */
  const toggleFullscreen = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (!videoRef.current) {
      return;
    }

    const video = videoRef.current as ExtendedHTMLVideoElement;

    if (video.requestFullScreen) {
      video.requestFullScreen();
    } else if (video.webkitRequestFullScreen) {
      video.webkitRequestFullScreen();
    } else if (video.mozRequestFullScreen) {
      video.mozRequestFullScreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  };

  return (
    <button
      aria-label="Full Screen"
      className="btn btn-link shadow-none mx-4 p-0 btn-sm"
      title="Full Screen"
      type="button"
      onClick={toggleFullscreen}
    >
      <i className="fas fa-expand" />
    </button>
  );
}

export default memo(VideoFullScreenButton);
