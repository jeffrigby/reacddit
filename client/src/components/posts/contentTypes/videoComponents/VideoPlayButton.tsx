import { memo } from 'react';

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
    <button
      aria-label={playTitle}
      className="btn btn-link shadow-none mx-4 p-0 btn-sm"
      title={playTitle}
      type="button"
      onClick={playStop}
    >
      <i className={playIconClass} />
    </button>
  );
}

export default memo(VideoPlayButton);
