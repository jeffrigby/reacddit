import {
  memo,
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import throttle from 'lodash/throttle';
import '../../../../styles/video.scss';
import VideoDebug from './VideoDebug';
import VideoAudioButton from './VideoAudioButton';
import VideoControlBar from './VideoControlBar';
import { PostsContextData } from '../../../../contexts';
const classNames = require('classnames');

/**
 * Extracts the buffer range information of a video.
 * @param {Ref} videoRef - The reference to the video element.
 * @param {number} idx - The index of the buffer range.
 * @returns {Object} - An object containing the buffer range information.
 *                    The object has the following properties:
 *                    - start: The start time of the buffer range.
 *                    - end: The end time of the buffer range.
 *                    - duration: The duration of the video.
 *                    - marginLeft: The left margin percentage of the buffer range.
 *                    - marginRight: The right margin percentage of the buffer range.
 *                    - range: The index of the buffer range.
 */
function extractBuffer(videoRef, idx) {
  const start = videoRef.current.buffered.start(idx);
  const end = videoRef.current.buffered.end(idx);
  const marginLeft = (start * 100) / videoRef.current.duration;
  const marginRight = 100 - (end * 100) / videoRef.current.duration;
  return {
    start,
    end,
    duration: videoRef.current.duration,
    marginLeft,
    marginRight,
    range: idx,
  };
}

/**
 * Retrieves the buffers of a video element.
 * @param {Object} videoRef - The reference to the video element.
 * @returns {Object} - An object containing the status and buffers of the video.
 */
function getBuffers(videoRef) {
  if (videoRef.current && videoRef.current.readyState > 2) {
    const bufferLength = videoRef.current.buffered.length;
    let range = 0;
    let status = 'loading';
    const buffers = [];
    while (range < bufferLength) {
      const bufferedRange = extractBuffer(videoRef, range);
      if (
        bufferedRange.start === 0 &&
        bufferedRange.end === videoRef.current.duration
      ) {
        status = 'full';
      }
      buffers.push(extractBuffer(videoRef, range));
      range += 1;
    }
    return { status, buffers };
  }
  return {};
}

/**
 * Renders a video player component.
 * @param {Object} props - The component props.
 * @param {string} props.link - The link to the video source.
 * @param {Object} props.content - The video content data.
 * @returns {JSX.Element} - The video player component.
 * @constructor
 */
function VideoComp({ link = '', content }) {
  const postContext = useContext(PostsContextData);
  const { isLoaded } = postContext;
  const videoRef = useRef();
  const isPlaying = useRef(false);
  const isPlayingTimeout = useRef(null);

  const debug = useSelector((state) => state.siteSettings.debug);
  const autoplay = useSelector((state) => state.siteSettings.autoplay);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(autoplay);
  const [autoplayState, setAutoplayState] = useState(autoplay);
  const [ctrLock, setCtrLock] = useState(false);
  const [controls, setControls] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [manualStop, setManualStop] = useState(false);
  const [canPlayThrough, setCanPlayThrough] = useState(false);
  const [showLoadError, setLoadError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffer, setBuffer] = useState({ status: 'unloaded', buffers: [] });

  useEffect(() => {
    // @todo this seems like a dumb way to handle not firing.
    if (!videoRef.current || autoplay === autoplayState) {
      return;
    }

    if (autoplay) {
      setAutoplayState(true);
      videoRef.current.play();
    } else if (!videoRef.current.paused) {
      setAutoplayState(false);
      videoRef.current.pause();
    }
  }, [videoRef, autoplay, autoplayState]);

  useEffect(() => {
    const canPlayTimeout = setTimeout(() => {
      if (!canPlay && isLoaded) {
        setLoadError(true);
      }
    }, 5000);
    return () => {
      clearTimeout(canPlayTimeout);
    };
  }, [canPlay, isLoaded]);

  const getSetBuffer = useMemo(
    () =>
      throttle(() => {
        if (buffer.status === 'full') {
          return;
        }
        const currentBuffers = getBuffers(videoRef);
        if (currentBuffers.status) {
          setBuffer(currentBuffers);
        }
      }, 500),
    [buffer.status]
  );

  useEffect(() => {
    getSetBuffer();
  }, [getSetBuffer, playing, currentTime, duration, canPlay, canPlayThrough]);

  const { width, height, sources } = content;

  const contStyle = {};
  contStyle.aspectRatio = `${width}/${height}`;
  contStyle.maxHeight = height < 740 ? height : undefined;

  const videoId = `video-${content.id}`;

  // In a const so I can pass it to the play button
  const toggleManualStop = useCallback((state) => {
    setManualStop(state);
  }, []);

  /**
   * Toggle lock to set the controls
   */
  const toggleLock = useCallback(() => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setManualStop(false);
    } else {
      videoRef.current.pause();
      setManualStop(true);
    }
    setCtrLock(!ctrLock);
  }, [ctrLock]);

  /**
   * Set the muted state if the volume is manually changed.
   */
  const eventVolumeChange = () => {
    if (videoRef.current.muted) {
      setMuted(true);
    } else {
      setMuted(false);
    }
  };

  const eventCanPlayThrough = (e) => {
    setCanPlayThrough(true);
    setStalled(false);
  };

  const eventWaiting = (e) => {
    setTimeout(() => {
      if (isLoaded && canPlay && isPlaying.current === false) {
        setWaiting(true);
      }
    }, 1000);
  };

  const eventStalled = (e) => {
    setTimeout(() => {
      setStalled(true);
    }, 250);
  };

  const eventCanPlay = (e) => {
    setCanPlay(true);
    setStalled(false);
  };

  const eventProgress = () => {
    getSetBuffer();
  };

  const throttledTime = useMemo(
    () =>
      throttle((time) => {
        setCurrentTime(time);
      }, 250),
    []
  );

  const trackPlaying = () => {
    if (videoRef.current) {
      clearTimeout(isPlayingTimeout.current);
      isPlaying.current = true;
      isPlayingTimeout.current = setTimeout(() => {
        isPlaying.current = false;
      }, 500);
    }
  };

  const eventTimeUpdate = (e) => {
    trackPlaying();
    throttledTime(videoRef.current.currentTime);
    if (stalled) {
      setStalled(false);
    }

    if (waiting) {
      setWaiting(false);
    }
  };

  const eventPlay = (e) => {
    setPlaying(true);
  };

  const eventPause = (e) => {
    setPlaying(false);
  };

  const eventDurationChange = (e) => {
    setDuration(videoRef.current.duration);
  };

  const videoClasses = classNames('loaded', 'preload', {
    'video-playing': playing,
    'video-paused': !playing,
    'audio-muted': muted,
    'audio-on': !muted,
    'manual-stop': manualStop,
  });

  let video;
  if (isLoaded === true) {
    const videoSources = sources.map((source, idx) => {
      const key = `${videoId}-${idx}`;
      return <source key={key} src={source.src} type={source.type} />;
    });

    video = (
      <video
        loop
        muted
        playsInline
        autoPlay={autoplay}
        className={videoClasses}
        controls={controls}
        id={videoId}
        key={videoId}
        ref={videoRef}
        onCanPlay={eventCanPlay}
        onCanPlayThrough={eventCanPlayThrough}
        onClick={toggleLock}
        onDurationChange={eventDurationChange}
        onPause={eventPause}
        onPlay={eventPlay}
        onProgress={eventProgress}
        onStalled={eventStalled}
        onTimeUpdate={eventTimeUpdate}
        onVolumeChange={eventVolumeChange}
        onWaiting={eventWaiting}
        // poster={content.thumb}
        // preload="auto"
      >
        {videoSources}
      </video>
    );
  }

  const videoContainerClass = [
    'video-container',
    'media-cont',
    'black-bg',
    muted ? 'muted' : 'unmuted',
    playing ? 'playing' : 'paused',
    ctrLock ? 'locked' : 'unlocked',
    isLoaded ? 'video-loaded' : 'video-unloaded',
  ];

  let loadingError;
  if (stalled && canPlay) {
    loadingError = (
      <>
        Video Loading Stalled
        <br />
        <a href={link} rel="noopener noreferrer" target="_blank">
          Open in new tab.
        </a>
      </>
    );
  } else if (waiting && canPlay) {
    loadingError = 'Loading Video';
  }

  const directLink = (
    <a href={link} rel="noopener noreferrer" target="_blank">
      Open in new tab.
    </a>
  );

  const loadError = showLoadError && !canPlay && (
    <div className="slow-loading">
      This is taking longer than it should. You can try to load the video
      directly.
      <br />
      {directLink}
    </div>
  );

  const btnClasses = 'btn btn-link shadow-none m-0 py-0 px-1 btn-md video-ctr';

  return (
    <>
      <div className={videoContainerClass.join(' ')}>
        {loadingError && (
          <div className="video-loading-error p-1 d-flex">
            <div>
              <i className="fas fa-circle-notch fa-spin mx-1" />
            </div>
            <div>{loadingError}</div>
          </div>
        )}
        <div className="media-ratio" style={contStyle}>
          {video}
        </div>
        {!canPlay && loadError}
        {isLoaded && videoRef.current && canPlay && (
          <>
            <div className="video-control-bar-cont">
              <VideoControlBar
                buffer={buffer}
                content={content}
                currentTime={currentTime}
                duration={duration}
                link={link}
                muted={muted}
                playing={playing}
                toggleManualStop={toggleManualStop}
                videoRef={videoRef}
              />
            </div>

            <div className="video-controls m-0 p-0">
              <button
                aria-label="Toggle Browser Video Controls"
                className={`${btnClasses} ${
                  controls ? 'ctrl-visible' : 'ctrl-hidden'
                } video-controls-toggle`}
                title="Toggle Browser Video Controls"
                type="button"
                onClick={() => setControls(!controls)}
              >
                <i className="fas fa-sliders-h" />
              </button>
              <VideoAudioButton
                audioWarning={content.audioWarning}
                btnClasses={btnClasses}
                hasAudio={content.hasAudio}
                link={link}
                muted={muted}
                videoRef={videoRef}
              />
            </div>
          </>
        )}
      </div>
      {debug && isLoaded && (
        <VideoDebug
          buffer={buffer}
          canPlay={canPlay}
          canPlayThrough={canPlayThrough}
          currentTime={currentTime}
          duration={duration}
          stalled={stalled}
          waiting={waiting}
        />
      )}
    </>
  );
}

VideoComp.propTypes = {
  link: PropTypes.string,
  content: PropTypes.object.isRequired,
};

export default memo(VideoComp);
