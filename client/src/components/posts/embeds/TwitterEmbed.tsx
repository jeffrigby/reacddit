import { useEffect, useRef, useState } from 'react';
import { useIntersectionObservers } from '@/contexts/IntersectionObserverContext';

interface TwitterEmbedProps {
  url: string;
}

// Extend window interface for Twitter widgets script
declare global {
  interface Window {
    twttr?: {
      widgets: {
        load(element?: Element): void;
      };
    };
  }
}

/**
 * Twitter embed component using official Twitter widgets SDK
 * - Auto-scales to fit content
 * - Unloads when off screen for performance
 * - Remembers height to prevent scroll jumps
 * - Prevents video autoplay
 */
function TwitterEmbed({ url }: TwitterEmbedProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);
  const { observeForMediaControl } = useIntersectionObservers();

  // Reset measured height on window resize (embeds are responsive)
  useEffect(() => {
    const handleResize = (): void => {
      setMeasuredHeight(0);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure height before unloading to prevent scroll jumps
  useEffect(() => {
    if (!containerRef.current || !isVisible) {
      return undefined;
    }

    const container = containerRef.current;

    // Use ResizeObserver to track height changes (Twitter loads asynchronously)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        // Only update if we got a reasonable height (embed has loaded)
        if (height > 100) {
          setMeasuredHeight(height);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [isVisible]);

  // Unload embed when off screen
  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const cleanup = observeForMediaControl(
      containerRef.current,
      (isOffScreen) => {
        // When fully off screen, unmount the embed
        setIsVisible(!isOffScreen);
      }
    );

    return cleanup;
  }, [observeForMediaControl, url]);

  // Load and process Twitter embed
  useEffect(() => {
    if (!isVisible || !containerRef.current) {
      return undefined;
    }

    const container = containerRef.current;

    // Load Twitter widgets script if not already loaded
    if (!document.getElementById('twitter-widgets-script')) {
      const script = document.createElement('script');
      script.id = 'twitter-widgets-script';
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.charset = 'utf-8';
      script.onload = () => {
        if (window.twttr?.widgets) {
          window.twttr.widgets.load(container);
        }
      };
      document.body.appendChild(script);
    } else if (window.twttr?.widgets) {
      // Script already loaded, just process embeds
      window.twttr.widgets.load(container);
    }

    // Cleanup: remove Twitter-rendered content when unmounting
    return () => {
      // Twitter adds a div with class twitter-tweet-rendered
      const renderedTweet = container.querySelector('.twitter-tweet-rendered');
      if (renderedTweet) {
        renderedTweet.remove();
      }
    };
  }, [url, isVisible]);

  // Aggressively prevent video autoplay
  useEffect(() => {
    if (!containerRef.current || !isVisible) {
      return undefined;
    }

    const container = containerRef.current;

    // Function to disable autoplay on video elements
    const disableAutoplay = (): void => {
      const videos = container.querySelectorAll('video');
      videos.forEach((video) => {
        if (video.autoplay || !video.paused) {
          // eslint-disable-next-line no-param-reassign
          video.autoplay = false;
          // eslint-disable-next-line no-param-reassign
          video.muted = true;
          video.pause();
          video.removeAttribute('autoplay');
          video.setAttribute('preload', 'metadata');
        }
      });
    };

    // Run immediately
    disableAutoplay();

    // Watch for video elements being added
    const observer = new MutationObserver(() => {
      disableAutoplay();
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['autoplay', 'src'],
    });

    // Also check periodically for the first 2 seconds (catch late-loading videos)
    const intervalId = setInterval(disableAutoplay, 100);
    const timeoutId = setTimeout(() => clearInterval(intervalId), 2000);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [isVisible, url]);

  // Convert x.com URLs to twitter.com for the blockquote
  // Twitter's widgets.js only recognizes twitter.com URLs
  const twitterUrl = url.replace('x.com', 'twitter.com');

  return (
    <div ref={containerRef}>
      {isVisible ? (
        <blockquote className="twitter-tweet" data-dnt="true">
          <a href={twitterUrl}>{twitterUrl}</a>
        </blockquote>
      ) : (
        <div
          style={{
            height: measuredHeight > 0 ? `${measuredHeight}px` : '200px',
            minHeight: '200px',
          }}
        />
      )}
    </div>
  );
}

export default TwitterEmbed;
