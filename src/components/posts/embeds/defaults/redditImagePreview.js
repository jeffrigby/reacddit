import parse from 'url-parse';

const redditImagePreview = entry => {
  if (entry.preview !== undefined) {
    const { source } = entry.preview.images[0];
    if (source) {
      const imagePreview = {
        type: 'image',
        width: source.width,
        height: source.height,
        src: source.url,
        renderFunction: 'redditImagePreview',
      };

      return imagePreview;
    }
  }

  const parsed = parse(entry.url);
  if (parsed.pathname.match(/\.(jpg|png|gif|jpeg)$/)) {
    const imagePreview = {
      type: 'image',
      width: 650,
      height: 650,
      src: entry.url,
      renderFunction: 'redditImagePreview',
    };

    return imagePreview;
  }

  return null;
};

export default redditImagePreview;
