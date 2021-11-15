import { memo } from 'react';
import PropTypes from 'prop-types';

function VideoAudioButton({
  hasAudio,
  audioWarning,
  muted,
  link,
  btnClasses,
  videoRef,
}) {
  /**
   * Toggle sound on and off
   */
  const toggleSound = () => {
    // eslint-disable-next-line no-param-reassign
    videoRef.current.muted = !videoRef.current.muted;
  };

  const mutedIconClass = `fas ${muted ? 'fa-volume-mute' : 'fa-volume-up'}`;
  const muteTitle = muted ? 'Play Sound' : 'Mute';

  return hasAudio ? (
    <span className="video-audio-cont">
      <button
        type="button"
        className={`${btnClasses} video-audio`}
        onClick={toggleSound}
        title={muteTitle}
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
          <a href={link} target="_blank" rel="noopener noreferrer">
            here
          </a>{' '}
          load the video on reddit.
        </span>
      )}
    </span>
  ) : null;
}

VideoAudioButton.propTypes = {
  audioWarning: PropTypes.bool,
  hasAudio: PropTypes.bool,
  muted: PropTypes.bool.isRequired,
  link: PropTypes.string,
  btnClasses: PropTypes.string.isRequired,
  videoRef: PropTypes.object.isRequired,
};

VideoAudioButton.defaultProps = {
  hasAudio: false,
  audioWarning: false,
  link: '',
};

export default memo(VideoAudioButton);
