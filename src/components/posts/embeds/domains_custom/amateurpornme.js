import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;

  const idMatch = pathname.match(/videos\/(\d+)/);
  if (idMatch) {
    const id = idMatch[1];
    if (!isNumeric(id)) return null;

    const url = `http://www.amateurporn.me/embed/${id}`;
    const content = {
      type: 'iframe16x9',
      src: url,
    };
    return content;
  }

  return null;
};

export default render;
