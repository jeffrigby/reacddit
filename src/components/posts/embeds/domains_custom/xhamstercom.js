import parse from 'url-parse';
import isNumeric from 'locutus/php/var/is_numeric';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const pathSplit = parsedUrl.pathname
    .replace(/^\/|\/$/g, '')
    .replace('videos/', '')
    .split('-');

  const id = pathSplit.pop();
  if (!isNumeric(id)) return null;

  const url = `https://xhamster.com/xembed.php?video=${id}`;

  const content = {
    type: 'iframe16x9',
    src: url,
  };
  return content;
};

export default render;

/**
 $path = pathinfo($entry['url']);
 $parts = explode('-', $path['filename']);
 $id = array_pop($parts);
 if (empty($id) || !is_numeric($id)) {
            return NULL;
        }

 $url = 'https://xhamster.com/xembed.php?video=' . $id;
 return ['type' => 'iframe16x9', 'src' => $url];
 */
