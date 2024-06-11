import parse from 'url-parse';
import { isNumeric } from '../../../../common';

const render = (entry) => {
  const parsedUrl = parse(entry.url, true);
  const id = parsedUrl.pathname.split('/').pop();

  if (isNumeric(id)) {
    return {
      type: 'twitter',
      id,
    };
  }

  return null;
};

export default render;
