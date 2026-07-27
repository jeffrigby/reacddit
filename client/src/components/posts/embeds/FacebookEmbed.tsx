import { useEffect, useRef, useState } from 'react';
import { usePostContext } from '@/contexts';

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
function FacebookEmbed({ url }: FacebookEmbedProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number>(0);

  // Visibility comes from the post, not from a media-control observer of our
  // own. Post.tsx already folds `!isActive` into `fullyOffScreen`, so reading
  // it here is what makes this embed (and its third-party iframe and its
  // ResizeObserver) go quiet while the post-detail overlay has this listing
  // tree suspended.
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

  // Load and process Facebook embed
  useEffect(() => {
    if (!isVisible) {
      return;
    }

    // Load Facebook SDK if not already loaded
    if (!document.getElementById('facebook-jssdk')) {
      // Initialize FB async callback (only set once when SDK is first loaded)
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

  // Reserve the last measured height on the OUTER box, which is not the
  // observed element, so it cannot feed back into measuredHeight. This holds
  // the layout across the placeholder -> embed swap: React re-mounts an empty
  // `.fb-post` div (0px until FB.XFBML.parse fills it), which would otherwise
  // collapse the listing every time the post-detail overlay closes over a
  // visible embed.
  const reservedHeight = measuredHeight > 0 ? `${measuredHeight}px` : undefined;

  return (
    <div
      style={{ maxWidth: '500px', margin: '0 auto', minHeight: reservedHeight }}
    >
      <div ref={containerRef}>
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
    </div>
  );
}

export default FacebookEmbed;
