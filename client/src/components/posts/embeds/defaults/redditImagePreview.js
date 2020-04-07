import parse from 'url-parse';

const redditImagePreview = (entry) => {
  if (entry.preview !== undefined) {
    const { resolutions } = entry.preview.images[0];
    const { source } = entry.preview.images[0];

    // Loop through the resolutions and find the first one above 625px
    let bestRes;
    resolutions.forEach((res, key) => {
      if (res.height > 625 && !bestRes) {
        bestRes = res;
      }
    });

    if (bestRes) {
      return {
        type: 'image',
        width: bestRes.width,
        height: bestRes.height,
        src: bestRes.url,
        renderFunction: 'redditImagePreview',
        source,
      };
    }

    // Fallback on the source if a suitable resolution doesn't exist.
    if (source) {
      return {
        type: 'image',
        width: source.width,
        height: source.height,
        src: source.url,
        renderFunction: 'redditImagePreview',
      };
    }
  }

  const parsed = parse(entry.url);

  if (parsed.pathname.match(/\.(jpg|png|gif|jpeg)$/)) {
    return {
      type: 'image',
      // width: 650,
      // height: 650,
      src: entry.url,
      renderFunction: 'redditImagePreview',
    };
  }

  return null;
};

export default redditImagePreview;
