import {
  memo,
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext,
  useCallback,
  type SyntheticEvent,
} from 'react';
import throttle from 'lodash/throttle';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import '../../../../styles/video.scss';
import VideoDebug from './VideoDebug';
import VideoAudioButton from './VideoAudioButton';
import VideoControlBar from './VideoControlBar';
import { PostsContextData } from '../../../../contexts';
import { useAppSelector } from '../../../../redux/hooks';
import type { VideoContent, BufferRange, BufferData } from './types';

// Type definitions
interface VideoCompProps {
  link?: string;
  content: VideoContent;
}

interface PostContextData {
  isLoaded: boolean;
  post?: {
    kind: string;
  };
}

/**
 * Extracts the buffer range information of a video.
 * @param videoRef - The reference to the video element.
 * @param idx - The index of the buffer range.
 * @returns An object containing the buffer range information.
 */
function extractBuffer(
  videoRef: React.RefObject<HTMLVideoElement>,
  idx: number
): BufferRange | null {
  const video = videoRef.current;
  if (!video) {
    return null;
  }
  const start = video.buffered.start(idx);
  const end = video.buffered.end(idx);
  const marginLeft = (start * 100) / video.duration;
  const marginRight = 100 - (end * 100) / video.duration;
  return {
    start,
    end,
    duration: video.duration,
    marginLeft,
    marginRight,
    range: idx.toString(),
  };
}

/**
 * Retrieves the buffers of a video element.
 * @param videoRef - The reference to the video element.
 * @returns An object containing the status and buffers of the video.
 */
function getBuffers(
  videoRef: React.RefObject<HTMLVideoElement>
): Partial<BufferData> {
  if (videoRef.current && videoRef.current.readyState > 2) {
    const bufferLength = videoRef.current.buffered.length;
    let range = 0;
    let status: BufferData['status'] = 'loading';
    const buffers: BufferRange[] = [];
    while (range < bufferLength) {
      const bufferedRange = extractBuffer(videoRef, range);
      if (bufferedRange) {
        if (
          bufferedRange.start === 0 &&
          bufferedRange.end === videoRef.current.duration
        ) {
          status = 'full';
        }
        buffers.push(bufferedRange);
      }
      range += 1;
    }
    return { status, buffers };
  }
  return {};
}

/**
 * Renders a video player component.
 */
function VideoComp({ link = '', content }: VideoCompProps) {
  const postContext = useContext(PostsContextData) as PostContextData;
  const { isLoaded } = postContext;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = useRef<boolean>(false);
  const isPlayingTimeout = useRef<NodeJS.Timeout | null>(null);
  const waitingTimeout = useRef<NodeJS.Timeout | null>(null);
  const stalledTimeout = useRef<NodeJS.Timeout | null>(null);

  const debug = useAppSelector((state) => state.siteSettings.debug);
  const autoplay = useAppSelector(
    (state) => state.siteSettings.autoplay as boolean
  );

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
  const [buffer, setBuffer] = useState<BufferData>({
    status: 'unloaded',
    buffers: [],
  });

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
  }, [autoplay, autoplayState]);

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
        const currentBuffers = getBuffers(
          videoRef as React.RefObject<HTMLVideoElement>
        );
        if (currentBuffers.status) {
          setBuffer(currentBuffers as BufferData);
        }
      }, 500),
    // Only create once - buffer.status is checked inside but we don't want to
    // recreate the throttled function when it changes, as that defeats throttling
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    getSetBuffer();
  }, [getSetBuffer, playing, currentTime, duration, canPlay, canPlayThrough]);

  const { width, height, sources } = content;

  const contStyle = useMemo<React.CSSProperties>(
    () => ({
      aspectRatio: `${width}/${height}`,
      maxHeight: height < 740 ? height : undefined,
    }),
    [width, height]
  );

  const videoId = `video-${content.id}`;

  // In a const so I can pass it to the play button
  const toggleManualStop = useCallback((stopped: boolean) => {
    setManualStop(stopped);
  }, []);

  /**
   * Toggle lock to set the controls
   */
  const toggleLock = useCallback(() => {
    if (!videoRef.current) {
      return;
    }

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
    if (videoRef.current) {
      setMuted(videoRef.current.muted);
    }
  };

  const eventCanPlayThrough = (e: SyntheticEvent<HTMLVideoElement>) => {
    setCanPlayThrough(true);
    setStalled(false);
  };

  const eventWaiting = () => {
    // Clear any existing timeout
    if (waitingTimeout.current) {
      clearTimeout(waitingTimeout.current);
    }
    waitingTimeout.current = setTimeout(() => {
      if (isLoaded && canPlay && isPlaying.current === false) {
        setWaiting(true);
      }
      waitingTimeout.current = null;
    }, 1000);
  };

  const eventStalled = () => {
    // Clear any existing timeout
    if (stalledTimeout.current) {
      clearTimeout(stalledTimeout.current);
    }
    stalledTimeout.current = setTimeout(() => {
      setStalled(true);
      stalledTimeout.current = null;
    }, 250);
  };

  const eventCanPlay = (e: SyntheticEvent<HTMLVideoElement>) => {
    setCanPlay(true);
    setStalled(false);
  };

  const eventProgress = () => {
    getSetBuffer();
  };

  const throttledTime = useMemo(
    () =>
      throttle((time: number) => {
        setCurrentTime(time);
      }, 250),
    []
  );

  // Cleanup effect for all timeouts and throttled functions
  useEffect(() => {
    return () => {
      // Cancel throttled functions
      getSetBuffer.cancel();
      throttledTime.cancel();

      // Clear all timeouts
      if (isPlayingTimeout.current) {
        clearTimeout(isPlayingTimeout.current);
      }
      if (waitingTimeout.current) {
        clearTimeout(waitingTimeout.current);
      }
      if (stalledTimeout.current) {
        clearTimeout(stalledTimeout.current);
      }
    };
  }, [getSetBuffer, throttledTime]);

  const trackPlaying = () => {
    if (videoRef.current) {
      if (isPlayingTimeout.current) {
        clearTimeout(isPlayingTimeout.current);
      }
      isPlaying.current = true;
      isPlayingTimeout.current = setTimeout(() => {
        isPlaying.current = false;
      }, 500);
    }
  };

  const eventTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
    trackPlaying();
    if (videoRef.current) {
      throttledTime(videoRef.current.currentTime);
    }
    if (stalled) {
      setStalled(false);
    }

    if (waiting) {
      setWaiting(false);
    }
  };

  const eventPlay = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlaying(true);
  };

  const eventPause = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlaying(false);
  };

  const eventDurationChange = (e: SyntheticEvent<HTMLVideoElement>) => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
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
              <FontAwesomeIcon spin className="mx-1" icon={faCircleNotch} />
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
                videoRef={videoRef as React.RefObject<HTMLVideoElement>}
              />
            </div>

            <div className="video-controls m-0 p-0">
              <button
                aria-label={
                  controls
                    ? 'Hide Browser Video Controls'
                    : 'Show Browser Video Controls'
                }
                className={`${btnClasses} ${
                  controls ? 'ctrl-visible' : 'ctrl-hidden'
                } video-controls-toggle`}
                title={
                  controls
                    ? 'Hide Browser Video Controls'
                    : 'Show Browser Video Controls'
                }
                type="button"
                onClick={() => setControls(!controls)}
              >
                <FontAwesomeIcon icon={controls ? faToggleOn : faToggleOff} />
              </button>
              <VideoAudioButton
                audioWarning={content.audioWarning}
                btnClasses={btnClasses}
                hasAudio={content.hasAudio}
                link={link}
                muted={muted}
                videoRef={videoRef as React.RefObject<HTMLVideoElement>}
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

export default memo(VideoComp);
