import parse from 'url-parse';
import axios from 'axios';
import redditImagePreview from '../defaults/redditImagePreview';
import redditVideoPreview from '../defaults/redditVideoPreview';

const render = async entry => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;
  const cleanedPath = pathname
    .substring(1)
    .replace(/\/new$/, '')
    .replace(/^\/|\/$/g, '');

  const id = cleanedPath.split('.')[0];

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
    const sources = [{ type: 'video/mp4', src: mp4 }];
    return {
      type: 'video',
      width,
      height,
      sources,
    };
  }

  // Check for mp4 content
  if (cleanedPath.match(/mp4$/)) {
    const mp4 = `https://i.imgur.com/${cleanedPath}`;
    const sources = [{ type: 'video/mp4', src: mp4 }];
    return {
      type: 'video',
      width,
      height,
      sources,
    };
  }

  // This is sooo hacky but it works. For now.
  // Check if an MP4 exists. If it does render it.
  // This is to cover cases when the image is animated
  // But Reddit doesn't have a video embed for it.
  if (
    !cleanedPath.match(/[gif|jpg|jpeg|mp4|gifv]$/) &&
    cleanedPath.substr(0, 2) !== 'a/' &&
    cleanedPath.substr(0, 2) !== 'gallery/'
  ) {
    try {
      const videoUrl = `https://i.imgur.com/${id}.mp4`;
      const checkType = await axios.head(videoUrl);

      if (checkType.status === 200) {
        const header = checkType.headers['content-type'];
        if (header === 'video/mp4') {
          const sources = [{ type: 'video/mp4', src: videoUrl }];
          return {
            width,
            height,
            sources,
            id: `video-${entry.name}`,
            type: 'video',
            thumb: `https://i.imgur.com/${id}.jpg`,
            hasAudio: false,
          };
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      // console.error(e);
    }
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
