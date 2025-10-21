import { memo, type MouseEvent } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import type { ExtendedHTMLVideoElement } from './types';

interface VideoFullScreenButtonProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

function VideoFullScreenButton({ videoRef }: VideoFullScreenButtonProps) {
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
    <Button
      aria-label="Full Screen"
      className="shadow-none mx-4 p-0"
      size="sm"
      title="Full Screen"
      variant="link"
      onClick={toggleFullscreen}
    >
      <FontAwesomeIcon icon={faExpand} />
    </Button>
  );
}

export default memo(VideoFullScreenButton);
