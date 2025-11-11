import type { RawHTMLEmbedContent } from '@/components/posts/embeds/types';

interface RawHTMLProps {
  content: RawHTMLEmbedContent;
}

function RawHTML({ content }: RawHTMLProps) {
  return (
    <div className="raw-html">
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </div>
  );
}

export default RawHTML;
