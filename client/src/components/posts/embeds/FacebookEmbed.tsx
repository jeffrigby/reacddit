import { useEffect, useRef, useState } from 'react';
import { useIntersectionObservers } from '@/contexts/IntersectionObserverContext';

interface FacebookEmbedProps {
  url: string;
}

// Extend window interface for Facebook SDK
declare global {
  interface Window {
    FB?: {
      XFBML: {
        parse(node?: Element): void;
      };
    };
    fbAsyncInit?: () => void;
  }
}

/**
 * Facebook embed component using official Facebook SDK
 * - Auto-scales to fit content
 * - Unloads when off screen for performance
 * - Remembers height to prevent scroll jumps
 */
function FacebookEmbed({ url }: FacebookEmbedProps): JSX.Element {
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

    // Use ResizeObserver to track height changes (Facebook loads asynchronously)
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

  // Load and process Facebook embed
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // Load Facebook SDK if not already loaded
    if (!document.getElementById('facebook-jssdk')) {
      // Initialize FB async callback
      window.fbAsyncInit = function () {
        if (window.FB) {
          window.FB.XFBML.parse();
        }
      };

      // Load the SDK
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src =
        'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode?.insertBefore(script, firstScript);
    } else if (window.FB) {
      // SDK already loaded, just parse embeds
      window.FB.XFBML.parse(containerRef.current ?? undefined);
    }
  }, [url, isVisible]);

  return (
    <div ref={containerRef} style={{ maxWidth: '500px', margin: '0 auto' }}>
      {isVisible ? (
        <div
          className="fb-post"
          data-href={url}
          data-show-text="true"
          data-width="500"
        />
      ) : (
        <div
          style={{
            height: measuredHeight > 0 ? `${measuredHeight}px` : '600px',
            minHeight: '600px',
          }}
        />
      )}
    </div>
  );
}

export default FacebookEmbed;
