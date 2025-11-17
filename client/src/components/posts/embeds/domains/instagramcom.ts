import type { LinkData } from '@/types/redditApi';

function render(
  entry: LinkData
): { type: 'social'; network: 'instagram'; url: string } | null {
  const { url } = entry;

  if (!url) {
    return null;
  }

  // Instagram embed.js only works for posts, reels, and IGTV
  // Profile pages, stories, etc. will show "content unavailable"
  // So we only return social embed for supported patterns
  const supportedPatterns = ['/p/', '/reel/', '/tv/'];
  const isSupported = supportedPatterns.some((pattern) =>
    url.includes(pattern)
  );

  if (!isSupported) {
    return null;
  }

  return {
    type: 'social',
    network: 'instagram',
    url,
  };
}

export default render;
