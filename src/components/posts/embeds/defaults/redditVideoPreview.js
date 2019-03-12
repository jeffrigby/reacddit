const redditVideoPreview = entry => {
  const rvp =
    entry.preview && entry.preview.reddit_video_preview
      ? entry.preview.reddit_video_preview
      : null;
  const mrv =
    entry.media && entry.media.reddit_video ? entry.media.reddit_video : null;

  let media = null;
  if (mrv) {
    media = mrv;
  } else if (rvp) {
    media = rvp;
  }

  if (media) {
    const sources = [
      { type: 'video/mp4', src: media.fallback_url },
      { type: 'video/mp4', src: media.scrubber_media_url },
      {
        type: 'application/vnd.apple.mpegURL',
        src: media.hls_url,
      },
    ];

    const videoPreview = {
      width: media.width,
      height: media.height,
      mp4: media.fallback_url,
      // webm: apiInfo.webmUrl,
      m3u8: media.hls_url,
      id: entry.name,
      type: 'video',
      sources,
      renderFunction: 'redditVideoPreview',
      thumb: entry.thumbnail ? entry.thumbnail : null,
    };

    return videoPreview;
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

      const videoPreview = {
        width: source.width,
        height: source.height,
        mp4: source.url,
        id: entry.name,
        type: 'video',
        sources,
        // thumb: apiInfo.thumb100PosterUrl,
      };
      return videoPreview;
    }
  }

  return null;
};

export default redditVideoPreview;
