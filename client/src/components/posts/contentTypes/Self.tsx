import { useContext, useState, useRef, useEffect, useCallback } from 'react';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDoubleDown,
  faAngleDoubleUp,
} from '@fortawesome/free-solid-svg-icons';
import { PostsContextData } from '@/contexts';
import { useAppSelector } from '@/redux/hooks';
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

interface PostContextData {
  post: {
    kind: string;
  };
  isLoaded: boolean;
}

const cleanLinks = (html: string): string => {
  let rawhtml = html;
  rawhtml = rawhtml
    .replace(
      /<a\s+href=/gi,
      '<a target="_blank" rel="noopener noreferrer" href='
    )
    .replace(/<p>&#x200B;<\/p>/gi, '')
    .replace(/<p>\s+<\/p>/gi, '');

  // Shorten all text in anchor tags
  const regex = /<a [^>]+>(https?:\/\/[^>]+)<\/a>/gm;
  const matches: string[] = [];
  let match = regex.exec(rawhtml);
  while (match !== null) {
    matches.push(match[1]);
    match = regex.exec(rawhtml);
  }

  if (matches.length > 0) {
    matches.forEach((link) => {
      if (link.length >= 20) {
        const newLink = `${link
          .replace(/https?:\/\//, '')
          .substring(0, 25)}...`;
        rawhtml = rawhtml.replace(`>${link}<`, `>${newLink}<`);
      }
    });
  }

  return rawhtml;
};

function Self({ name, content }: SelfProps) {
  const postContext = useContext(PostsContextData) as PostContextData;
  const { post } = postContext;

  const listType = useAppSelector(
    (state) => state.listings.currentFilter.listType
  );
  const debug = useAppSelector((state) => state.siteSettings.debugMode);

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

  if (!content?.html) {
    return null;
  }

  const rawhtml = cleanLinks(content.html);

  const contentClasses = classNames('self-html', {
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
