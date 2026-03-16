import type { RawHTMLEmbedContent } from '@/components/posts/embeds/types';
import { sanitizeHTML } from '@/utils/sanitize';

interface RawHTMLProps {
  content: RawHTMLEmbedContent;
}

function RawHTML({ content }: RawHTMLProps) {
  return (
    <div className="raw-html">
      {/* Content sanitized via DOMPurify before rendering */}
      <div dangerouslySetInnerHTML={{ __html: sanitizeHTML(content.html) }} />
    </div>
  );
}

export default RawHTML;
