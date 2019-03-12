import parse from 'url-parse';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { query } = parsedUrl;
  if (!query || !query.viewkey) {
    return null;
  }
  const url = `https://pornhub.com/embed/${query.viewkey}`;

  const content = {
    type: 'iframe16x9',
    src: url,
  };

  return content;
};

export default render;
