import parse from 'url-parse';
import type { LinkData } from '../../../../types/redditApi';
import type { SocialEmbedContent } from '../types';

function render(entry: LinkData): SocialEmbedContent | null {
  const { url } = entry;
  if (!url) {
    return null;
  }

  const urlParsed = parse(url);
  const { pathname, origin } = urlParsed;
  const urlPath = pathname.split('/');

  if (!urlPath.includes('posts')) {
    return null;
  }

  return {
    type: 'social',
    network: 'facebook',
    url: `${origin}${pathname}`,
  };
}

export default render;
