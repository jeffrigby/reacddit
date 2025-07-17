import { memo } from 'react';

interface VideoAudioButtonProps {
  hasAudio?: boolean;
  audioWarning?: boolean;
  muted: boolean;
  link?: string;
  btnClasses: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

function VideoAudioButton({
  hasAudio = false,
  audioWarning = false,
  muted,
  link = '',
  btnClasses,
  videoRef,
}: VideoAudioButtonProps) {
  /**
   * Toggle sound on and off
   */
  const toggleSound = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.muted = !video.muted;
    }
  };

  const mutedIconClass = `fas ${muted ? 'fa-volume-mute' : 'fa-volume-up'}`;
  const muteTitle = muted ? 'Play Sound' : 'Mute';

  return hasAudio ? (
    <span className="video-audio-cont">
      <button
        aria-label={muteTitle}
        className={`${btnClasses} video-audio`}
        title={muteTitle}
        type="button"
        onClick={toggleSound}
      >
        <i className={mutedIconClass} />
      </button>
      {audioWarning && link && (
        <span
          className="audio-disabled bg-dark border border-light p-1"
          role="tooltip"
        >
          This video probably has audio but Reddit disables it on third-party
          sites though Safari still works (for now). Click{' '}
          <a href={link} rel="noopener noreferrer" target="_blank">
            here
          </a>{' '}
          load the video on reddit.
        </span>
      )}
    </span>
  ) : null;
}

export default memo(VideoAudioButton);
