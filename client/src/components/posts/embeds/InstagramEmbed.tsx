import { useEffect, useRef, useState } from 'react';
import { useIntersectionObservers } from '@/contexts/IntersectionObserverContext';

interface InstagramEmbedProps {
  url: string;
}

// Extend window interface for Instagram embed script
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process(): void;
      };
    };
  }
}

/**
 * Instagram embed component using official Instagram embed script
 * - Auto-scales to fit content
 * - Unloads when off screen for performance
 * - Remembers height to prevent scroll jumps
 */
function InstagramEmbed({ url }: InstagramEmbedProps): JSX.Element {
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

    // Use ResizeObserver to track height changes (Instagram loads asynchronously)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.contentRect.height;
        // Only update if we got a reasonable height (embed has loaded)
        if (height > 200) {
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

  // Load and process Instagram embed
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // Load Instagram embed script if not already loaded
    if (!document.getElementById('instagram-embed-script')) {
      const script = document.createElement('script');
      script.id = 'instagram-embed-script';
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
      document.body.appendChild(script);
    } else if (window.instgrm) {
      // Script already loaded, just process embeds
      window.instgrm.Embeds.process();
    }
  }, [url, isVisible]);

  return (
    <div ref={containerRef} style={{ maxWidth: '540px', margin: '0 auto' }}>
      {isVisible ? (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: '0',
            borderRadius: '3px',
            boxShadow:
              '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
            margin: '1px',
            maxWidth: '540px',
            minWidth: '326px',
            padding: '0',
            width: 'calc(100% - 2px)',
          }}
        />
      ) : (
        <div
          style={{
            height: measuredHeight > 0 ? `${measuredHeight}px` : '400px',
            minHeight: '400px',
          }}
        />
      )}
    </div>
  );
}

export default InstagramEmbed;
