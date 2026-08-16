import { useEffect, useRef, useState } from 'react';
import { usePostContext } from '@/contexts';

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
function TwitterEmbed({ url }: TwitterEmbedProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  // Visibility comes from the post, not from a media-control observer of our
  // own. Post.tsx already folds `!isActive` into `fullyOffScreen`, so reading
  // it here is what makes this embed (and its third-party iframe, its
  // ResizeObserver and its MutationObserver) go quiet while the post-detail
  // overlay has this listing tree suspended.
  const { fullyOffScreen } = usePostContext();
  const isVisible = !fullyOffScreen;

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

    return () => {
      observer.disconnect();
    };
  }, [isVisible, url]);

  // Convert x.com URLs to twitter.com for the blockquote
  // Twitter's widgets.js only recognizes twitter.com URLs
  const twitterUrl = url.replace('x.com', 'twitter.com');

  // Reserve the last measured height on the OUTER box, which is not the
  // observed element, so it cannot feed back into measuredHeight. This holds
  // the layout across the placeholder -> blockquote swap: React re-mounts a
  // bare, unrendered blockquote (~30px) and widgets.js needs a syndication
  // round-trip to fill it, which would otherwise collapse the listing every
  // time the post-detail overlay closes over a visible tweet.
  const reservedHeight = measuredHeight > 0 ? `${measuredHeight}px` : undefined;

  return (
    <div style={{ minHeight: reservedHeight }}>
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
    </div>
  );
}

export default TwitterEmbed;
