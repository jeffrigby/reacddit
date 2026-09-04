import { usePostContext } from '@/contexts';
import renderSelf from '@/components/posts/embeds/domains/self';
import { findBestResolution } from '@/components/posts/embeds/defaults/redditImagePreview';
import type { LinkData } from '@/types/redditApi';
import Self from './contentTypes/Self';

function Placeholder() {
  const postContext = usePostContext();
  const { post } = postContext;
  const { data } = post;

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

      // Same pick order as redditImagePreview, so the placeholder box and the
      // ImageComp that replaces it resolve to identical dimensions.
      if (preview.images) {
        const { resolutions, source } = preview.images[0];

        const bestRes = resolutions && findBestResolution(resolutions);
        if (bestRes) {
          return [bestRes.width, bestRes.height];
        }

        if (source) {
          return [source.width, source.height];
        }
      }
    }

    return [];
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

    // Must match ImageComp/VideoComp/IFrame exactly, or the swap from
    // placeholder to real media is a layout shift.
    return (
      <div className="content">
        <div className="media-cont black-bg">
          <div
            className="media-ratio"
            style={{
              aspectRatio: `${width}/${height}`,
              maxHeight: height && height < 740 ? height : undefined,
            }}
          />
        </div>
      </div>
    );
  }

  return <div className="content" />;
}

export default Placeholder;
