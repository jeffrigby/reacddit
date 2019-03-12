import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;
  const id = pathname.replace(/^\/|\/$/g, '');

  if (!isNumeric(id)) return null;

  const url = `https://embed.redtube.com/?id=${id}&bgcolor=000000`;
  const content = {
    type: 'iframe16x9',
    src: url,
  };
  return content;
};

export default render;
