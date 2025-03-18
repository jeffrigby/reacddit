const { detect } = require('detect-browser');

const browser = detect();

const redditVideoPreview = (entry) => {
  const rvp =
    entry.preview && entry.preview.reddit_video_preview
      ? entry.preview.reddit_video_preview
      : null;
  const mrv =
    entry.secure_media && entry.secure_media.reddit_video
      ? entry.secure_media.reddit_video
      : null;

  let media = null;
  if (mrv) {
    media = mrv;
  } else if (rvp) {
    media = rvp;
  }

  let poster = entry.thumbnail ? entry.thumbnail : null;
  try {
    poster = entry.preview.images[0].source.url;
  } catch (e) {
    console.error(`redditVideoPreview: Error getting poster`, e);
    // continue
  }

  if (media) {
    const sources = [];
    let audioWarning = true;

    // For some reason safari doesn't care about the CORS violation and can play sound.
    // Firefox and chrome don't work even with hls.js & dash.js embeds.
    if (browser.name === 'safari' || browser.name === 'ios') {
      sources.push({
        type: 'application/vnd.apple.mpegURL',
        src: media.hls_url,
      });
      audioWarning = false;
    }
    // sources.push({ type: 'application/dash+xml', src: media.dash_url });
    sources.push({ type: 'video/mp4', src: media.fallback_url });

    return {
      media,
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

  // Look for the mp4 source. Split this up?
  const { images } = entry.preview;
  if (images) {
    const { mp4 } = images[0].variants;
    if (mp4) {
      const { source } = mp4;

      const sources = [{ type: 'video/mp4', src: source.url }];

      return {
        width: source.width,
        height: source.height,
        id: entry.name,
        type: 'video',
        sources,
        thumb: poster,
      };
    }
  }

  return null;
};

export default redditVideoPreview;
