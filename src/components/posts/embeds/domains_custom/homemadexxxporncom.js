import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const pathSplit = parsedUrl.pathname.substr(1).split('/');
  const id = pathSplit[1];
  if (isNumeric(id)) {
    const url = `http://www.homemadexxxporn.com/embed/${id}`;
    const content = {
      type: 'iframe16x9',
      src: url,
    };

    return content;
  }

  return null;
};

export default render;
