import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = (entry) => {
  const parsedUrl = parse(entry.url, true);
  const id = parsedUrl.pathname.split('/').pop();

  if (isNumeric(id)) {
    const content = {
      type: 'twitter',
      id,
    };
    return content;
  }

  return null;
};

export default render;
