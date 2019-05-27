import parse from 'url-parse';

const redditImagePreview = entry => {
  if (entry.preview !== undefined) {
    const { resolutions } = entry.preview.images[0];
    const { source } = entry.preview.images[0];

    // Get the highest resolution source.
    if (resolutions[5]) {
      return {
        type: 'image',
        width: resolutions[5].width,
        height: resolutions[5].height,
        src: resolutions[5].url,
        renderFunction: 'redditImagePreview',
        source,
      };
    }

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
      width: 650,
      height: 650,
      src: entry.url,
      renderFunction: 'redditImagePreview',
    };
  }

  return null;
};

export default redditImagePreview;
