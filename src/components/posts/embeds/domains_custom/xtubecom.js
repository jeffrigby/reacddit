import parse from 'url-parse';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;

  if (pathname.includes('video-watch/')) {
    const embedPath = pathname
      .replace(/^\/|\/$/g, '')
      .replace('video-watch/', 'video-watch/embedded/');
    const url = `https://www.xtube.com/${embedPath}?embedSize=big`;
    const content = {
      type: 'iframe16x9',
      src: url,
    };
    return content;
  }

  return null;
};

export default render;
