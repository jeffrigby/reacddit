import { useContext, useState, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { LinkData } from '@/types/redditApi';
import { PostsContextData } from '@/contexts';

interface IFrameContent {
  src: string;
  width?: number;
  height?: number;
  allow?: string;
  sandbox?: string;
  referrerPolicy?: ReferrerPolicy | string;
  loading?: 'lazy' | 'eager';
  iframeStyle?: CSSProperties;
  onLoad?: () => void;
}

interface IFrameProps {
  content: IFrameContent;
}

interface PostContextData {
  post: {
    data: LinkData;
  };
  isLoaded: boolean;
}

function IFrame({
  content: {
    src,
    width = 16,
    height = 9,
    allow = 'fullscreen',
    sandbox = 'allow-scripts allow-same-origin',
    referrerPolicy = 'no-referrer-when-downgrade',
    loading = 'eager',
    iframeStyle = {},
    onLoad = () => {},
  },
}: IFrameProps) {
  const postContext = useContext(PostsContextData) as PostContextData;
  const { title } = postContext.post.data;
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const style: CSSProperties = {};
  style.aspectRatio = `${width}/${height}`;

  const { isLoaded } = postContext;

  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    onLoad();
  }, [onLoad]);

  return (
    <div className="media-cont black-bg">
      <div className="media-ratio" style={style}>
        {isLoaded && (
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
