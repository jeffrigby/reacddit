import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const pathSplit = parsedUrl.pathname.replace(/^\/|\/$/g, '').split('/');

  if (pathSplit[0] === 'favorite') return null;

  const id = pathSplit[0].replace('video', '');
  if (!isNumeric(id)) return null;
  const url = `https://xvideos.com/embedframe/${id}`;

  const content = {
    type: 'iframe16x9',
    src: url,
  };
  return content;
};

export default render;
