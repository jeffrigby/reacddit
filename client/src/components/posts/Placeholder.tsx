import { useContext } from 'react';
import { PostsContextData, type PostContextData } from '@/contexts';
import renderSelf from '@/components/posts/embeds/domains/self';
import type { LinkData } from '@/types/redditApi';
import Self from './contentTypes/Self';

interface RatioInfo {
  width: number;
  ratio: number;
  contStyle: { width: string };
  ratioStyle: { paddingBottom: string };
}

function Placeholder() {
  const postContext = useContext(PostsContextData) as PostContextData;
  const { post } = postContext;
  const { data } = post;

  function getRatio(width: number, height: number): RatioInfo {
    const maxHeight = 625;

    const widthContrained =
      height > maxHeight ? (width * maxHeight) / height : width;
    const heightConstrained = height > maxHeight ? maxHeight : height;
    const ratio = (heightConstrained / widthContrained) * 100;

    return {
      width: widthContrained,
      ratio,
      contStyle: { width: `${widthContrained}px` },
      ratioStyle: { paddingBottom: `${ratio}%` },
    };
  }

  function getDimensions(): [number, number] | [] {
    const linkData = data as LinkData;
    const { preview } = linkData;
    if (preview) {
      // Check for video preview
      if (preview.reddit_video_preview) {
        return [
          preview.reddit_video_preview.width,
          preview.reddit_video_preview.height,
        ];
      }

      // Check for source
      if (preview.images) {
        const { resolutions } = preview.images[0];
        if (resolutions[5]) {
          return [resolutions[5].width, resolutions[5].height];
        }

        const { source } = preview.images[0];
        if (source) {
          return [source.width, source.height];
        }
      }
    }

    return [];
  }

  function getRatioRounded(width: number, height: number): number {
    return Math.round((width / height) * 100) / 100;
  }

  function fixedRatio(r: string): React.JSX.Element {
    return (
      <div className="content">
        <div className="media-cont black-bg">
          <div className="media-contain-width">
            <div className={`ratio ratio-${r} black-bg`} />
          </div>
        </div>
      </div>
    );
  }

  const linkData = data as LinkData;
  if (linkData.is_self && linkData.selftext) {
    const selfContent = renderSelf(linkData);
    return (
      <div className="content">
        <Self content={selfContent} name={linkData.name} />
      </div>
    );
  }

  const dimensions = getDimensions();
  if (dimensions.length) {
    const [width, height] = dimensions;
    const ratioRounded = getRatioRounded(width, height);
    if (ratioRounded >= 1.76 && ratioRounded <= 1.79) {
      return fixedRatio('16x9');
    }

    if (ratioRounded >= 1.3 && ratioRounded <= 1.36) {
      return fixedRatio('4x3');
    }

    if (ratioRounded >= 2.3 && ratioRounded <= 2.36) {
      return fixedRatio('21x9');
    }

    if (ratioRounded === 1) {
      return fixedRatio('1x1');
    }

    const { contStyle, ratioStyle } = getRatio(width, height);

    return (
      <div className="content">
        <div className="media-cont">
          <div className="ratio-bg">
            <div className="ratio-container" style={contStyle}>
              <div className="ratio embed-responsive" style={ratioStyle} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="content" />;
}

export default Placeholder;
