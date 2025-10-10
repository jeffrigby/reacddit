import parse from 'url-parse';
import axios from 'axios';
import type { LinkData } from '../../../../types/redditApi';
import type { VideoEmbedContent, ImageEmbedContent } from '../types';
import redditImagePreview from '../defaults/redditImagePreview';
import redditVideoPreview from '../defaults/redditVideoPreview';

async function getMP4(
  id: string,
  name: string,
  width: number,
  height: number
): Promise<VideoEmbedContent | false> {
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
          hasAudio: true,
        };
      }
    }
  } catch (e) {
    console.error(`IMGUR: Error fetching MP4: ${e}`);
    return false;
  }
  return false;
}

function cleanPath(pathname: string): string {
  return pathname
    .substring(1)
    .replace(/\/new$/, '')
    .replace(/^\/|\/$/g, '');
}

function getEmbedId(entry: LinkData): string | false {
  try {
    if (!entry.secure_media_embed?.content) {
      return false;
    }
    const embeddlySrs = entry.secure_media_embed.content.match(/src="(\S+)" /);
    if (!embeddlySrs?.[1]) {
      return false;
    }
    const embeddlySrsParsed = parse(embeddlySrs[1], true);
    const embedSrc = parse(embeddlySrsParsed.query.image as string);
    const embedSrcClean = cleanPath(embedSrc.pathname);
    return embedSrcClean.split('.')[0];
  } catch (e) {
    console.error(`IMGUR: Error getting embed ID: ${e}`);
    // Ignore warning and continue
  }
  return false;
}

async function render(
  entry: LinkData
): Promise<VideoEmbedContent | ImageEmbedContent | null> {
  const parsedUrl = parse(entry.url, true);
  const { pathname } = parsedUrl;

  const cleanedPath = cleanPath(pathname);

  const id = cleanedPath.split('.')[0];

  // Try to get width and height
  let width = 1024;
  let height = 768;

  if (entry.preview?.images?.[0]?.source) {
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
      id: `imgur-${id}`,
      width,
      height,
      sources,
      imgurRenderType: 'imgurGifVPath',
      hasAudio: true,
    };
  }

  // Check for mp4 content
  if (cleanedPath.match(/mp4$/)) {
    const mp4 = `https://i.imgur.com/${cleanedPath}`;
    const sources = [{ type: 'video/mp4', src: mp4 }];
    return {
      type: 'video',
      id: `imgur-${id}`,
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
    !cleanedPath.startsWith('a/') &&
    !cleanedPath.startsWith('gallery/')
  ) {
    const mp4 = await getMP4(id, entry.name, width, height);
    if (mp4) {
      return { ...mp4, imgurRenderType: 'imgurMP4' };
    }
  }

  // Look for album MP4. This works sometimes. Last ditch effort.
  if (cleanedPath.startsWith('a/')) {
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
}

export default render;
