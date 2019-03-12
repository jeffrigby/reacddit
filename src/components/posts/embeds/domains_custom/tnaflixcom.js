import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const id = parsedUrl.pathname.match(/.+video(\d+)/i);

  if (!isNumeric(id[1])) {
    return null;
  }
  const url = `https://player.tnaflix.com/video/${id[1]}`;

  const content = {
    type: 'iframe16x9',
    src: url,
  };

  return content;
};

export default render;
