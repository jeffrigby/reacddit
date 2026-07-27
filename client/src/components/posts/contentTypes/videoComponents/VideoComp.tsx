import {
  memo,
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  type SyntheticEvent,
} from 'react';
import throttle from 'lodash/throttle';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleNotch,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import '@/styles/video.scss';
import { usePostContext } from '@/contexts';
import { useAppSelector } from '@/redux/hooks';
import VideoDebug from './VideoDebug';
import VideoAudioButton from './VideoAudioButton';
import VideoControlBar from './VideoControlBar';
import VideoLoadError from './VideoLoadError';
import type {
  VideoContent,
  BufferRange,
  BufferData,
  VideoDiagnosticInfo,
} from './types';

// Type definitions
interface VideoCompProps {
  link?: string;
  content: VideoContent;
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
  const postContext = usePostContext();
  const { isLoaded, fullyOffScreen } = postContext;
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlaying = useRef<boolean>(false);
  const isPlayingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stalledTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasPlayingBeforeOffScreen = useRef<boolean>(false);

  const debug = useAppSelector((state) => state.siteSettings.debug);
  const autoplay = useAppSelector((state) => state.siteSettings.autoplay);

  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(autoplay);
  const prevAutoplayRef = useRef(autoplay);
  const [ctrLock, setCtrLock] = useState(false);
  const [controls, setControls] = useState(false);
  const [stalled, setStalled] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [manualStop, setManualStop] = useState(false);
  const [canPlayThrough, setCanPlayThrough] = useState(false);
  const [showLoadError, setShowLoadError] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffer, setBuffer] = useState<BufferData>({
    status: 'unloaded',
    buffers: [],
  });

  useEffect(() => {
    if (!videoRef.current || autoplay === prevAutoplayRef.current) {
      return;
    }
    prevAutoplayRef.current = autoplay;

    if (autoplay) {
      // Flipping the setting on must not start videos that are only sitting in
      // the pre-load band - that is exactly the buffering we are trying to
      // avoid. The scroll-driven autoPlayVideos() starts them when they
      // actually come into view.
      if (!fullyOffScreen) {
        videoRef.current.play();
      }
    } else if (!videoRef.current.paused) {
      videoRef.current.pause();
    }
    // fullyOffScreen is read, not tracked: the ref guard above makes this
    // effect a no-op unless the autoplay setting itself changed.
  }, [autoplay, fullyOffScreen]);

  // Pause video when fully off-screen, resume when back on-screen
  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    if (fullyOffScreen) {
      // Video is now fully off-screen - pause it
      if (!videoRef.current.paused) {
        wasPlayingBeforeOffScreen.current = true;
        videoRef.current.pause();
      }
    } else {
      // Video is back on-screen - resume if it was playing before
      if (wasPlayingBeforeOffScreen.current && videoRef.current.paused) {
        videoRef.current.play();
        wasPlayingBeforeOffScreen.current = false;
      }
    }
  }, [fullyOffScreen, isLoaded]);

  // Has anything actually asked this element to fetch media yet? Now that
  // preload is throttled (see preloadStrategy below), a video that is
  // off-screen, or that the user has autoplay disabled for, legitimately never
  // reaches `canplay` - nothing asked it to load. The slow-load watchdog below
  // must not fire in that case or every such video reports a bogus "taking
  // longer than it should". A source that is genuinely broken still reports,
  // via the element's `error` event (eventError below) - the watchdog only
  // covers the slow-but-not-failed case.
  const playbackRequested = autoplay ? !fullyOffScreen : playing;

  useEffect(() => {
    if (canPlay || !isLoaded || !playbackRequested) {
      return;
    }

    const canPlayTimeout = setTimeout(() => {
      setShowLoadError(true);
    }, 5000);
    return () => {
      clearTimeout(canPlayTimeout);
    };
  }, [canPlay, isLoaded, playbackRequested]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps, @eslint-react/exhaustive-deps
    []
  );

  const { width = 16, height = 9, sources, thumb } = content;

  const contStyle = useMemo<React.CSSProperties>(
    () => ({
      aspectRatio: `${width}/${height}`,
      maxHeight: height && height < 740 ? height : undefined,
    }),
    [width, height]
  );

  const videoId = `video-${content.id}`;

  const toggleManualStop = useCallback((stopped: boolean) => {
    setManualStop(stopped);
  }, []);

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

  const eventVolumeChange = () => {
    if (videoRef.current) {
      setMuted(videoRef.current.muted);
    }
  };

  const eventCanPlayThrough = (e: SyntheticEvent<HTMLVideoElement>) => {
    setCanPlayThrough(true);
    setStalled(false);
    getSetBuffer();
  };

  const eventWaiting = () => {
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
    getSetBuffer();
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

  useEffect(() => {
    return () => {
      getSetBuffer.cancel();
      throttledTime.cancel();

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
    getSetBuffer();
  };

  const eventPause = (e: SyntheticEvent<HTMLVideoElement>) => {
    setPlaying(false);
  };

  // Resource selection failed outright (dead v.redd.it, 404 imgur .mp4,
  // unsupported codec). Report it immediately rather than waiting on the
  // watchdog below: that timer only runs once playback was requested, so with
  // the autoplay setting off a broken source would otherwise render as a
  // permanently black box with no message and no direct link.
  const eventError = () => {
    setShowLoadError(true);
  };

  const eventDurationChange = (e: SyntheticEvent<HTMLVideoElement>) => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
    getSetBuffer();
  };

  // There was no preload attribute at all before (the 'preload' string below is
  // a CSS class), so a fully-read listing left every mounted <video> on the
  // browser default - preload="auto" on desktop Chrome - buffering minutes of
  // media for entries nobody is looking at.
  //
  // Off-screen: "none", no fetch whatsoever. On-screen: "metadata", not "none",
  // for two reasons. A source with no `thumb` has no poster to paint, so "none"
  // would leave it an empty black box until something asks for media (every
  // handler that can omit `thumb` should set one - see imgurcom.ts); and with
  // the autoplay setting off nothing ever requests media, so `canplay` - which
  // gates the control bar and audio button below - would not fire until the
  // user clicked. "metadata" is a bounded header fetch that settles to
  // NETWORK_IDLE. When autoplay is on the autoplay attribute overrides preload
  // and fetches as much as playback needs, exactly as before.
  const preloadStrategy = fullyOffScreen ? 'none' : 'metadata';

  const videoClasses = clsx('loaded', 'preload', {
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

    // autoPlay is gated on visibility, not just the setting. Entries mount
    // inside a 500px/2000px pre-load band, so the bare attribute started
    // playback (and aggressive buffering) for videos far below the fold the
    // instant they mounted, independent of the pause effect above. Post's
    // media-control observer does a synchronous off-screen check in the same
    // effect flush that sets shouldLoad, so an entry that mounts below the fold
    // already has fullyOffScreen=true on the render that first creates this
    // element - the attribute is never briefly true for those.
    //
    // Coming back into view does NOT re-arm the attribute (the HTML "can
    // autoplay" flag is cleared once an element plays or pauses), so resuming
    // stays owned by the pause/resume effect above and by autoPlayVideos().
    video = (
      <video
        loop
        muted
        playsInline
        autoPlay={autoplay && !fullyOffScreen}
        className={videoClasses}
        controls={controls}
        id={videoId}
        key={videoId}
        poster={thumb ?? undefined}
        preload={preloadStrategy}
        ref={videoRef}
        onCanPlay={eventCanPlay}
        onCanPlayThrough={eventCanPlayThrough}
        onClick={toggleLock}
        onDurationChange={eventDurationChange}
        onError={eventError}
        onPause={eventPause}
        onPlay={eventPlay}
        onProgress={eventProgress}
        onStalled={eventStalled}
        onTimeUpdate={eventTimeUpdate}
        onVolumeChange={eventVolumeChange}
        onWaiting={eventWaiting}
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

  const getDiagnosticInfo = (): VideoDiagnosticInfo | string => {
    if (!videoRef.current) {
      return 'Video element not initialized';
    }

    const video = videoRef.current;
    const readyStateNames = [
      'HAVE_NOTHING',
      'HAVE_METADATA',
      'HAVE_CURRENT_DATA',
      'HAVE_FUTURE_DATA',
      'HAVE_ENOUGH_DATA',
    ];
    const networkStateNames = [
      'NETWORK_EMPTY',
      'NETWORK_IDLE',
      'NETWORK_LOADING',
      'NETWORK_NO_SOURCE',
    ];

    return {
      readyState: `${video.readyState} (${readyStateNames[video.readyState] ?? 'UNKNOWN'})`,
      networkState: `${video.networkState} (${networkStateNames[video.networkState] ?? 'UNKNOWN'})`,
      error: video.error
        ? `${video.error.code}: ${video.error.message}`
        : 'None',
      sources: sources.map((s) => `${s.type}: ${s.src}`).join('; '),
      autoplay: video.autoplay,
      muted: video.muted,
      playsInline: video.playsInline,
    };
  };

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
        <VideoLoadError
          canPlay={canPlay}
          link={link}
          showLoadError={showLoadError}
          videoRef={videoRef}
        />
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
          diagnosticInfo={getDiagnosticInfo()}
          duration={duration}
          stalled={stalled}
          waiting={waiting}
        />
      )}
    </>
  );
}

export default memo(VideoComp);
