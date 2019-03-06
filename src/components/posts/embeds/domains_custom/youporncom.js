import parse from 'url-parse';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;
  const cleanedPath = pathname.replace(/^\/|\/$/g, '').replace('watch/', '');
  const url = `https://youporn.com/embed/${cleanedPath}`;
  const content = {
    type: 'iframe16x9',
    src: url,
  };
  return content;
};

export default render;
