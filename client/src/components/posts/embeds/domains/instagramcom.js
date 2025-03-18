// import parse from 'url-parse';

const render = (entry) => {
  // This doesn't work for some reason

  const { url } = entry;
  // const urlParsed = parse(url);
  // const { pathname, origin } = urlParsed;

  if (!url) {
    return null;
  }

  // This doesn't work for some reason
  return null;

  // return {
  //   type: 'social',
  //   network: 'instagram',
  //   url: `${origin}${pathname}`,
  // };
};

export default render;
