import { isIOS, isSafari } from '@/common';
import type { LinkData, ImageDetails } from '../../../../types/redditApi';
import type {
  VideoEmbedContent,
  ImageEmbedContent,
  VideoSource,
} from '../types';

/**
 * Selects the optimal video resolution based on viewport width.
 * Chooses the smallest resolution that is >= 100% of viewport width.
 * This optimizes bandwidth while ensuring video quality matches or exceeds viewport size.
 *
 * @param source - The full resolution video source
 * @param resolutions - Array of available lower resolution alternatives
 * @returns The optimal resolution to use
 */
function selectOptimalResolution(
  source: ImageDetails,
  resolutions: ImageDetails[]
): ImageDetails {
  // Use viewport width at time of render (SSR safe)
  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1920;

  // Sort resolutions by width (ascending: smallest to largest)
  const sortedResolutions = [...resolutions].sort((a, b) => a.width - b.width);

  // Find the smallest resolution that's >= viewport width
  for (const res of sortedResolutions) {
    if (res.width >= viewportWidth) {
      return res;
    }
  }

  // If no resolution is large enough, use full resolution
  return source;
}

function redditVideoPreview(
  entry: LinkData
): VideoEmbedContent | ImageEmbedContent | null {
  const rvp = entry.preview?.reddit_video_preview ?? null;
  const mrv = entry.secure_media?.reddit_video ?? null;

  let media = null;
  if (mrv) {
    media = mrv;
  } else if (rvp) {
    media = rvp;
  }

  let poster: string | null = entry.thumbnail ? entry.thumbnail : null;
  try {
    if (entry.preview?.images?.[0]?.source?.url) {
      poster = entry.preview.images[0].source.url;
    }
  } catch (e) {
    console.error(`redditVideoPreview: Error getting poster`, e);
    // continue
  }

  if (media) {
    const sources: VideoSource[] = [];
    let audioWarning = true;

    // Safari (including all iOS browsers which use WebKit) supports HLS and doesn't have
    // CORS issues with audio playback. Firefox and Chrome don't work with hls.js/dash.js.
    if (isSafari() || isIOS()) {
      sources.push({
        type: 'application/vnd.apple.mpegURL',
        src: media.hls_url,
      });
      audioWarning = false;
    }
    // sources.push({ type: 'application/dash+xml', src: media.dash_url }); // DASH doesn't work
    sources.push({
      type: 'video/mp4',
      src: media.fallback_url,
    });

    return {
      width: media.width,
      height: media.height,
      hasAudio: !media.is_gif || false,
      audioWarning,
      id: entry.name,
      type: 'video',
      sources,
      renderFunction: 'redditVideoPreview',
      thumb: poster,
    };
  }

  if (entry.preview === undefined) {
    return null;
  }

  const { images } = entry.preview;
  if (images) {
    const { mp4 } = images[0].variants;
    if (mp4) {
      const { source, resolutions } = mp4;

      // iOS workaround: Serve animated GIFs as <img> instead of <video>
      // iOS has issues loading MP4 videos of animated GIFs, but the GIFs work perfectly in img tags
      // This matches Reddit's native iOS behavior
      if (isIOS()) {
        // Use entry.url which points to the actual animated GIF on i.redd.it
        // NOT images[0].source.url which is the preview thumbnail with format=png8
        return {
          width: source.width,
          height: source.height,
          type: 'image',
          src: entry.url, // The actual animated GIF URL (e.g., https://i.redd.it/xyz.gif)
        };
      }

      // Select optimal resolution based on viewport width
      // Uses smallest resolution that's >= 100% of viewport to optimize bandwidth
      const selectedSource =
        resolutions && resolutions.length > 0
          ? selectOptimalResolution(source, resolutions)
          : source;

      return {
        width: source.width,
        height: source.height,
        id: entry.name,
        type: 'video',
        sources: [
          {
            type: 'video/mp4',
            src: selectedSource.url,
          },
        ],
        thumb: poster,
      };
    }
  }

  return null;
}

export default redditVideoPreview;
