import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import Content from '@/components/posts/Content';
import { sanitizeHref } from '@/utils/sanitize';
import type { EmbedContent } from '@/components/posts/embeds/types';

interface ResolvedContent {
  content: EmbedContent;
  link: string;
}

interface SelfInlineProps {
  inline: EmbedContent[];
  inlineLinks: string[];
  name: string;
}

function SelfInline({ inline, inlineLinks, name }: SelfInlineProps) {
  const [inlineIdx, setInlineIdx] = useState(0);
  const resolvedContent = useMemo(() => {
    const resolved: ResolvedContent[] = [];
    inline.forEach((value, key) => {
      if (value) {
        resolved.push({
          content: value,
          link: inlineLinks[key],
        });
      }
    });
    return resolved;
  }, [inline, inlineLinks]);

  const totalLinks = resolvedContent.length;
  if (!totalLinks) {
    return null;
  }

  const prevEntry = () => {
    const prevIdx = inlineIdx === 0 ? totalLinks - 1 : inlineIdx - 1;
    setInlineIdx(prevIdx);
  };

  const nextEntry = () => {
    const nextIdx = inlineIdx === totalLinks - 1 ? 0 : inlineIdx + 1;
    setInlineIdx(nextIdx);
  };

  const inlineKey = `${name}-${inlineIdx}`;
  const inlineLink = resolvedContent[inlineIdx].link;
  const inlineLinkTrunc =
    inlineLink.length > 50 ? `${inlineLink.slice(0, 50)}...` : inlineLink;

  const inlineRendered = resolvedContent[inlineIdx].content ? (
    <div className="inline-render">
      <Content content={resolvedContent[inlineIdx].content} key={inlineKey} />
    </div>
  ) : (
    'Embed Failed'
  );

  let inlineNav;
  if (inline.length > 1) {
    inlineNav = (
      <nav aria-label="Inline-Link Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item">
            <button
              aria-label="Previous"
              className="page-link shadow-none"
              type="button"
              onClick={prevEntry}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">
              {inlineIdx + 1} / {totalLinks}
            </span>
          </li>
          <li className="page-item">
            <button
              aria-label="Next"
              className="page-link shadow-none"
              type="button"
              onClick={nextEntry}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <div className="inlineLinks">
      {inlineNav}
      {inlineRendered}
      <div className="small">
        Source:{' '}
        <a
          href={sanitizeHref(inlineLink)}
          rel="noreferrer"
          target="_blank"
          title={inlineLink}
        >
          {inlineLinkTrunc}
        </a>
      </div>
    </div>
  );
}

export default SelfInline;
