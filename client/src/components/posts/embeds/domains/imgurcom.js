import parse from 'url-parse';
import axios from 'axios';
import redditImagePreview from '../defaults/redditImagePreview';
import redditVideoPreview from '../defaults/redditVideoPreview';

async function getMP4(id, name, width, height) {
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
          id: `video-${name}`,
          type: 'video',
          thumb: `https://i.imgur.com/${id}.jpg`,
          hasAudio: false,
        };
      }
    }
  } catch (e) {
    return false;
  }
  return false;
}

function cleanPath(pathname) {
  return pathname
    .substring(1)
    .replace(/\/new$/, '')
    .replace(/^\/|\/$/g, '');
}

function getEmbedId(entry) {
  try {
    if (!entry.secure_media_embed.content) return false;
    const embeddlySrs = entry.secure_media_embed.content.match(/src="(\S+)" /);
    if (!embeddlySrs[1]) return false;
    const embeddlySrsParsed = parse(embeddlySrs[1], true);
    const embedSrc = parse(embeddlySrsParsed.query.image);
    const embedSrcClean = cleanPath(embedSrc.pathname);
    return embedSrcClean.split('.')[0];
  } catch (e) {
    // Ignore warning and continue
  }
  return false;
}

const render = async (entry) => {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;

  const cleanedPath = cleanPath(pathname);

  const id = cleanedPath.split('.')[0];

  // Try to get width and height
  let width = 1024;
  let height = 768;

  if (entry.preview) {
    const { width: w, height: h } = entry.preview.images[0].source;
    width = w;
    height = h;
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
      imgurRenderType: 'imgurGifVPath',
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
      imgurRenderType: 'imgurMP4Path',
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
    const mp4 = await getMP4(id, entry.name, width, height);
    if (mp4) {
      return { ...mp4, imgurRenderType: 'imgurMP4' };
    }
  }

  // Look for album MP4. This works sometimes. Last ditch effort.
  if (cleanedPath.substr(0, 2) === 'a/') {
    const embedID = getEmbedId(entry);
    if (embedID) {
      const embedMp4 = await getMP4(embedID, entry.name, width, height);
      if (embedMp4) {
        return { ...embedMp4, imgurRenderType: 'albumMP4' };
      }
    }
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

  // Check for preview image:
  try {
    const { url } = entry;
    const urlParsed = parse(url);
    const secureEntry = { ...entry };
    if (urlParsed.protocol === 'http:') {
      secureEntry.url = secureEntry.url.replace(/^http:/, 'https:');
    }
    const image = redditImagePreview(secureEntry);
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

  return {
    type: 'image',
    width,
    height,
    src,
    imgurRenderType: 'imgurImagePath',
  };
};

export default render;
