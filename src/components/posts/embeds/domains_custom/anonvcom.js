import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;
  const cleanedPath = pathname
    .replace(/^\/|\/$/g, '')
    .replace('videos/', '')
    .split('/');
  const id = cleanedPath[0];

  if (!isNumeric(id)) return null;

  const url = `https://anon-v.com/embed/${id}`;
  const content = {
    type: 'iframe16x9',
    src: url,
  };
  return content;
};

export default render;
