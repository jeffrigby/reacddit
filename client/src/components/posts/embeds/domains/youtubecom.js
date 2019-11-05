import parse from 'url-parse';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  if (parsedUrl.query.v) {
    const youtubeid = parsedUrl.query.v;
    const src = `https://www.youtube.com/embed/${youtubeid}`;
    return {
      type: 'iframe16x9',
      id: youtubeid,
      src,
    };
  }

  return null;
};

export default render;
