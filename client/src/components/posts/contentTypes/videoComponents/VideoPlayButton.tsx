import { memo } from 'react';
import { Button } from 'react-bootstrap';

interface VideoPlayButtonProps {
  /** The video reference. */
  videoRef: React.RefObject<HTMLVideoElement>;
  /** Indicates whether the video is currently playing. */
  playing: boolean;
  /** Callback function to toggle manual stop. */
  toggleManualStop: (stopped: boolean) => void;
}

/**
 * Renders a video play button.
 * @param props - The properties object.
 * @returns The video play button component.
 */
function VideoPlayButton({
  videoRef,
  playing,
  toggleManualStop,
}: VideoPlayButtonProps) {
  const playIconClass = `fas ${playing ? 'fa-pause' : 'fa-play'}`;
  const playTitle = playing ? 'Pause' : 'Play';

  const playStop = () => {
    if (videoRef.current?.paused) {
      videoRef.current.play();
      toggleManualStop(false);
    } else {
      videoRef.current?.pause();
      toggleManualStop(true);
    }
  };

  return (
    <Button
      aria-label={playTitle}
      className="shadow-none mx-4 p-0"
      size="sm"
      title={playTitle}
      variant="link"
      onClick={playStop}
    >
      <i className={playIconClass} />
    </Button>
  );
}

export default memo(VideoPlayButton);
