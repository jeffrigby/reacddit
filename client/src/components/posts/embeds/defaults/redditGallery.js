const redditGallery = (entry) => {
  const media = [];

  Object.values(entry.media_metadata).forEach((value) => {
    if (value.status === 'valid') {
      media.push({
        key: value.id,
        type: value.e,
        source: value.s,
        thumb: value.p[0],
        preview: value.p[value.p.length - 1],
      });
    }
  });

  return {
    type: 'redditGallery',
    media,
    renderFunction: 'redditGallery',
  };
};

export default redditGallery;
