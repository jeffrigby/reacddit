import { useState, useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import type { LinkData } from '@/types/redditApi';
import {
  usePostContext,
  useIntersectionObservers,
  useListingsActive,
} from '@/contexts';
import { isSafeUrl } from '@/utils/sanitize';

interface IFrameContent {
  src: string;
  width?: number;
  height?: number;
  allow?: string;
  sandbox?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  loading?: 'lazy' | 'eager';
  iframeStyle?: CSSProperties;
  onLoad?: () => void;
}

interface IFrameProps {
  content: IFrameContent;
}

function IFrame({
  content: {
    src,
    width = 16,
    height = 9,
    allow = 'fullscreen',
    sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
    referrerPolicy = 'no-referrer-when-downgrade',
    loading = 'eager',
    iframeStyle = {},
    onLoad = () => {},
  },
}: IFrameProps) {
  const postContext = usePostContext();
  const { title } = postContext.post.data as LinkData;
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const contRef = useRef<HTMLDivElement>(null);
  const [inMountBand, setInMountBand] = useState(false);
  const { observeForEmbedMount } = useIntersectionObservers();
  const isActive = useListingsActive();

  const style: CSSProperties = {};
  style.aspectRatio = `${width}/${height}`;

  const { isLoaded } = postContext;

  useEffect(() => {
    if (!contRef.current) {
      return undefined;
    }
    return observeForEmbedMount(contRef.current, setInMountBand);
  }, [observeForEmbedMount]);

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    onLoad();
  }, [onLoad]);

  // Block non-https protocols (javascript:, data:, vbscript:, etc.)
  if (!isSafeUrl(src, true)) {
    return null;
  }

  // Mount the iframe only while the post sits in the embed-mount band, so
  // scrolling away actually reclaims it, and unmount it outright while this
  // listing tree is suspended behind the post-detail overlay.
  //
  // This intentionally replaces an earlier `hasBeenOnScreen` latch that kept
  // the iframe mounted until the post had been seen once, so an embed resolved
  // below the fold could pre-load. That latch had no teardown path: an entry
  // that resolved below the fold and was never actually scrolled into view kept
  // its iframe for the life of the listing. The band keeps the pre-load - just
  // a much smaller one than the load observer's 2000px, which is what makes it
  // bounded - so embeds are still painted before they are scrolled to instead
  // of spinning on arrival.
  const shouldRenderIframe = isLoaded && isActive && inMountBand;

  return (
    <div ref={contRef} className="media-cont black-bg">
      <div className="media-ratio" style={style}>
        {shouldRenderIframe && (
          <iframe
            allowFullScreen
            allow={allow}
            className={iframeLoaded ? '' : 'loading-icon'}
            loading={loading}
            referrerPolicy={referrerPolicy}
            sandbox={sandbox}
            scrolling="no"
            src={src}
            style={iframeStyle}
            title={title}
            onLoad={handleIframeLoad}
          />
        )}
      </div>
    </div>
  );
}

export default IFrame;
