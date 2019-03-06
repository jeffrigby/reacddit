import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);

  const cleanedPath = parsedUrl.pathname.substring(1).replace(/^\/|\/$/g, '');
  const id = cleanedPath.replace('v/', '');

  if (isNumeric(id)) {
    const url = `https://smutr.com/embed/${id}`;
    const content = {
      type: 'iframe16x9',
      src: url,
    };

    return content;
  }
  return null;
};

export default render;
