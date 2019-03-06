import parse from 'url-parse';
import redditImagePreview from '../defaults/redditImagePreview';
import redditVideoPreview from '../defaults/redditVideoPreview';

const render = entry => {
  // Fallback video content
  try {
    const video = redditVideoPreview(entry);
    if (video) {
      return {
        ...video,
        renderFunction: 'redditVideoPreview',
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  // Check for preview image:
  try {
    const image = redditImagePreview(entry);
    if (image) {
      return {
        ...image,
        renderFunction: 'redditImagePreview',
      };
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }

  if (!entry.preview) {
    return null;
  }

  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;
  const cleanedPath = pathname
    .substring(1)
    .replace(/\/new$/, '')
    .replace(/^\/|\/$/g, '');

  // Try to get width and height
  const { width, height } = entry.preview.images[0].source;

  const id = cleanedPath.split('.')[0];

  const src = `https://i.imgur.com/${id}h.jpg`;

  const imageRender = {
    type: 'image',
    width,
    height,
    src,
  };

  return imageRender;
};

export default render;

/** *
 private function _get_imgurId($url) {
        $url = rtrim($url, '/');
        $url = preg_replace('/\/new$/', '', $url);
        $pathinfo = pathinfo($url);
        $parse_url = parse_url($pathinfo['dirname']);
        $imgur_id = parse_url($pathinfo['filename']);
        $imgur_id = $imgur_id['path'];
        if (empty($imgur_id)) {
            return FALSE;
        }
        return array(
            'id' => $imgur_id,
            'type' => !empty($parse_url['path']) ? trim($parse_url['path'], '/') : NULL
        );
    }
 * */
