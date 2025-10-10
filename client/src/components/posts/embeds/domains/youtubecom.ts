import parse from 'url-parse';
import type { LinkData } from '../../../../types/redditApi';
import type { IFrameEmbedContent } from '../types';

function render(entry: LinkData): IFrameEmbedContent | null {
  const parsedUrl = parse(entry.url, true);
  const youtubeid = parsedUrl.query.v;

  if (!youtubeid) {
    return null;
  }

  const { title } = entry;
  const src = `https://www.youtube.com/embed/${youtubeid}`;

  return {
    type: 'iframe',
    title,
    // 560x315 is the default size for youtube embeds
    width: 560,
    height: 315,
    src,
    allow:
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    referrerPolicy: 'strict-origin-when-cross-origin',
  };
}

export default render;
