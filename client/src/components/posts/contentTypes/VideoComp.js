import React, {
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
import '../../../styles/video.scss';
import VideoDebug from './videoComponents/VideoDebug';
import VideoAudioButton from './videoComponents/VideoAudioButton';
import VideoControlBar from './videoComponents/VideoControlBar';
import { PostsContextData } from '../../../contexts';

const classNames = require('classnames');

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

const VideoComp = ({ link, content }) => {
  const postContext = useContext(PostsContextData);
  const load = postContext.isLoaded;
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

  const isMounted = useRef(true);
  useEffect(
    () => () => {
      isMounted.current = false;
    },
    []
  );

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
      if (!canPlay && load && isMounted.current) {
        setLoadError(true);
      }
    }, 5000);
    return () => {
      clearTimeout(canPlayTimeout);
    };
  }, [canPlay, load]);

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
    if (isMounted.current) {
      getSetBuffer();
    }
  }, [getSetBuffer, playing, currentTime, duration, canPlay, canPlayThrough]);

  const { width, height, sources } = content;
  let videoWidth = width;
  let videoHeight = height;

  // Size down if needed
  const maxHeight = 625;
  if (height > maxHeight) {
    videoWidth = (width * maxHeight) / height;
    videoHeight = maxHeight;
  }

  const finalWidth =
    videoHeight > 800 ? (videoWidth * 800) / videoHeight : videoWidth;
  const contStyle = { width: `${finalWidth}px` };
  const ratio = (videoHeight / videoWidth) * 100;
  const ratioStyle = { paddingBottom: `${ratio}%` };
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
      if (load && canPlay && isPlaying.current === false && isMounted.current) {
        setWaiting(true);
      }
    }, 1000);
  };

  const eventStalled = (e) => {
    setTimeout(() => {
      if (isMounted.current) {
        setStalled(true);
      }
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
        if (isMounted.current) {
          isPlaying.current = false;
        }
      }, 500);
    }
  };

  const eventTimeUpdate = (e) => {
    if (isMounted.current) {
      trackPlaying();
      throttledTime(videoRef.current.currentTime);
      if (stalled) {
        setStalled(false);
      }

      if (waiting) {
        setWaiting(false);
      }
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

  const videoClasses = classNames(
    'loaded',
    'embed-responsive-item',
    'preload',
    {
      'video-playing': playing,
      'video-paused': !playing,
      'audio-muted': muted,
      'audio-on': !muted,
      'manual-stop': manualStop,
    }
  );

  let video;
  if (load === true) {
    const videoSources = sources.map((source, idx) => {
      const key = `${videoId}-${idx}`;
      return <source src={source.src} type={source.type} key={key} />;
    });

    video = (
      <video
        autoPlay={autoplay}
        // preload="auto"
        loop
        muted
        playsInline
        controls={controls}
        id={videoId}
        key={videoId}
        onClick={toggleLock}
        // poster={content.thumb}
        className={videoClasses}
        onPlay={eventPlay}
        onPause={eventPause}
        onStalled={eventStalled}
        onCanPlay={eventCanPlay}
        onCanPlayThrough={eventCanPlayThrough}
        onWaiting={eventWaiting}
        onVolumeChange={eventVolumeChange}
        onTimeUpdate={eventTimeUpdate}
        onDurationChange={eventDurationChange}
        onProgress={eventProgress}
        ref={videoRef}
      >
        {videoSources}
      </video>
    );
  }

  const videoContainerClass = [
    'video-container',
    'media-cont',
    muted ? 'muted' : 'unmuted',
    playing ? 'playing' : 'paused',
    ctrLock ? 'locked' : 'unlocked',
    load ? 'video-loaded' : 'video-unloaded',
  ];

  let loadingError;
  if (stalled && canPlay) {
    loadingError = (
      <>
        Video Loading Stalled
        <br />
        <a href={link} target="_blank" rel="noopener noreferrer">
          Open in new tab.
        </a>
      </>
    );
  } else if (waiting && canPlay) {
    loadingError = 'Loading Video';
  }

  const directLink = (
    <a href={link} target="_blank" rel="noopener noreferrer">
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
        <div className="ratio-bg">
          <div style={contStyle} className="ratio-container">
            <div
              style={ratioStyle}
              className="ratio embed-responsive loading-icon"
            >
              {video}
              {!canPlay && loadError}
            </div>
          </div>
        </div>
        {load && videoRef.current && canPlay && (
          <>
            <div className="video-control-bar-cont">
              <VideoControlBar
                videoRef={videoRef}
                duration={duration}
                currentTime={currentTime}
                playing={playing}
                muted={muted}
                content={content}
                link={link}
                buffer={buffer}
                toggleManualStop={toggleManualStop}
              />
            </div>

            <div className="video-controls m-0 p-0">
              <button
                type="button"
                className={`${btnClasses} ${
                  controls ? 'ctrl-visible' : 'ctrl-hidden'
                } video-controls-toggle`}
                onClick={() => setControls(!controls)}
                title="Toggle Browser Video Controls"
              >
                <i className="fas fa-sliders-h" />
              </button>
              <VideoAudioButton
                link={link}
                videoRef={videoRef}
                audioWarning={content.audioWarning}
                hasAudio={content.hasAudio}
                muted={muted}
                btnClasses={btnClasses}
              />
            </div>
          </>
        )}
      </div>
      {debug && load && (
        <VideoDebug
          currentTime={currentTime}
          duration={duration}
          buffer={buffer}
          canPlay={canPlay}
          canPlayThrough={canPlayThrough}
          stalled={stalled}
          waiting={waiting}
        />
      )}
    </>
  );
};

VideoComp.propTypes = {
  link: PropTypes.string,
  content: PropTypes.object.isRequired,
};

VideoComp.defaultProps = {
  link: '',
};

export default React.memo(VideoComp);
