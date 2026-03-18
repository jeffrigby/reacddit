import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDoubleDown,
  faAngleDoubleUp,
} from '@fortawesome/free-solid-svg-icons';
import { usePostContext } from '@/contexts';
import { useAppSelector } from '@/redux/hooks';
import { sanitizeHTML } from '@/utils/sanitize';
import type { EmbedContent } from '@/components/posts/embeds/types';
import SelfInline from './SelfInline';
import '../../../styles/self.scss';

interface SelfContent {
  expand?: boolean;
  html?: string;
  inline: EmbedContent[];
  inlineLinks?: string[];
}

interface SelfProps {
  name: string;
  content: SelfContent;
}

const HTTP_URL_RE = /^https?:\/\//;
const WHITESPACE_ONLY_RE = /^\s*$/;

const cleanLinks = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Set target and rel on all anchor tags; shorten long URL text
  doc.querySelectorAll('a').forEach((anchor) => {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
    const text = anchor.textContent ?? '';
    if (HTTP_URL_RE.test(text) && text.length >= 20) {
      const shortened = `${text.replace(HTTP_URL_RE, '').substring(0, 25)}...`;
      anchor.replaceChildren(shortened);
    }
  });

  // Remove zero-width-space and whitespace-only paragraphs
  doc.querySelectorAll('p').forEach((p) => {
    if (
      p.textContent === '\u200B' ||
      WHITESPACE_ONLY_RE.test(p.textContent ?? '')
    ) {
      p.remove();
    }
  });

  return doc.body.innerHTML;
};

function Self({ name, content }: SelfProps) {
  const postContext = usePostContext();
  const { post } = postContext;

  const listType = useAppSelector(
    (state) => state.listings.currentFilter.listType
  );
  const debug = useAppSelector((state) => state.siteSettings.debug);

  const contentRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(content?.expand ?? false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check if content overflows its max-height constraint
  const checkOverflow = useCallback(() => {
    if (!contentRef.current) {
      return;
    }

    const { scrollHeight, clientHeight } = contentRef.current;
    // 10px threshold to avoid showing button for tiny overflows
    if (scrollHeight > clientHeight + 10) {
      setHasOverflow(true);
    }
  }, []);

  // Check overflow after initial render and when content changes
  useEffect(() => {
    // Reset overflow state when content changes
    setHasOverflow(false);
    checkOverflow();
  }, [checkOverflow, content.html]);

  // Recheck if images load (images can change content height)
  useEffect(() => {
    if (!contentRef.current) {
      return;
    }

    const images = contentRef.current.querySelectorAll('img');
    if (images.length === 0) {
      return;
    }

    const handleImageLoad = (): void => checkOverflow();

    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener('load', handleImageLoad, { once: true });
      }
    });

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', handleImageLoad);
      });
    };
  }, [content.html, checkOverflow]);

  const toggleExpansion = useCallback(() => {
    if (content.expand) {
      return;
    } // Locked in expanded state
    setIsExpanded((prev) => !prev);
  }, [content.expand]);

  const rawhtml = useMemo(
    () => (content.html ? sanitizeHTML(cleanLinks(content.html)) : ''),
    [content.html]
  );

  if (!content?.html) {
    return null;
  }

  const contentClasses = clsx('self-html', {
    'self-fade': hasOverflow && !isExpanded,
    'sf-html-show-all': isExpanded,
  });

  const buttonIcon = isExpanded ? faAngleDoubleUp : faAngleDoubleDown;
  const buttonText = isExpanded ? 'Collapse' : 'Read More';

  return (
    <div className={`self self-${post.kind} self-${post.kind}-${listType}`}>
      <div className={contentClasses} ref={contentRef}>
        <div dangerouslySetInnerHTML={{ __html: rawhtml }} />
      </div>

      {hasOverflow && (
        <div className="self-show-more">
          <Button
            className="shadow-none p-0"
            size="sm"
            title={buttonText}
            variant="link"
            onClick={toggleExpansion}
          >
            <FontAwesomeIcon icon={buttonIcon} /> {buttonText}
          </Button>
        </div>
      )}

      {content.inline?.length > 0 && content.inlineLinks && (
        <SelfInline
          inline={content.inline}
          inlineLinks={content.inlineLinks}
          name={name}
        />
      )}

      {debug && (
        <code>
          Has Overflow: {String(hasOverflow)}
          <br />
          Is Expanded: {String(isExpanded)}
        </code>
      )}
    </div>
  );
}

export default Self;
