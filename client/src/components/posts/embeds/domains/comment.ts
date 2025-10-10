import type { CommentData } from '../../../../types/redditApi';
import type { SelfTextContent } from '../types';

function render(entry: CommentData): SelfTextContent {
  const html = entry.body_html ?? '';

  const content: SelfTextContent = {
    type: 'self',
    html,
    inline: [],
  };

  return content;
}

export default render;
