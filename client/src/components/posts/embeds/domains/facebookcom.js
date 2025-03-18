import parse from 'url-parse';

const render = (entry) => {
  const { url } = entry;
  if (!url) {
    return null;
  }

  const urlParsed = parse(url);
  const { pathname, origin } = urlParsed;
  const urlPath = pathname.split('/');

  // urlpath must contain "posts"
  if (!urlPath.includes('posts')) {
    return null;
  }

  return {
    type: 'social',
    network: 'facebook',
    url: `${origin}${pathname}`,
  };
};

export default render;
