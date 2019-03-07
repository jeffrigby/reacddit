import parse from 'url-parse';
import redditImagePreview from '../defaults/redditImagePreview';
import redditVideoPreview from '../defaults/redditVideoPreview';

const render = entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;
  const cleanedPath = pathname
    .substring(1)
    .replace(/\/new$/, '')
    .replace(/^\/|\/$/g, '');

  // Try to get width and height
  let width = 1024;
  let height = 768;

  if (entry.preview) {
    const { width: w, height: h } = entry.preview.images[0].source;
    width = w;
    height = h;
  }

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

  // Check for gifv content;
  if (cleanedPath.match(/gifv$/)) {
    const mp4Filename = cleanedPath.replace(/gifv$/, 'mp4');
    const mp4 = `https://i.imgur.com/${mp4Filename}`;
    return {
      type: 'video',
      width,
      height,
      mp4,
    };
  }

  // Check for mp4 content
  if (cleanedPath.match(/mp4$/)) {
    const mp4 = `https://i.imgur.com/${cleanedPath}`;
    return {
      type: 'video',
      width,
      height,
      mp4,
    };
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
