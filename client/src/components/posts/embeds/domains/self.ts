import type { LinkData } from '../../../../types/redditApi';
import type { SelfTextContent } from '../types';

function render(entry: LinkData): SelfTextContent {
  const html = entry.selftext_html ?? '';

  const content: SelfTextContent = {
    type: 'self',
    html,
    inline: [],
  };

  return content;
}

export default render;
