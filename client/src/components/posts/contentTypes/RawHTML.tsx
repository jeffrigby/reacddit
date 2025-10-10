import type { RawHTMLContent } from './types';

interface RawHTMLProps {
  content: RawHTMLContent;
}

function RawHTML({ content }: RawHTMLProps) {
  return (
    <div className="raw-html">
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    </div>
  );
}

export default RawHTML;
