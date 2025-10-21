import type { LinkData } from '../../../../types/redditApi';

function render(entry: LinkData): null {
  const { url } = entry;

  if (!url) {
    return null;
  }

  // Instagram embeds don't work - social media embed rendering issues
  return null;
}

export default render;
