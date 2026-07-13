import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';
import clsx from 'clsx';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAngleDoubleDown,
  faAngleDoubleUp,
} from '@fortawesome/free-solid-svg-icons';
import { usePostContext, useListingsFilter, useIsOverlay } from '@/contexts';
import { useAppSelector } from '@/redux/hooks';
import { sanitizeHTML } from '@/utils/sanitize';
import { buildDetailNavState, isCommentsPath } from '@/utils/navigationState';
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
const REDDIT_HOST_RE =
  /^https?:\/\/(?:www\.|old\.|new\.|np\.|sh\.)?reddit\.com\//i;

/**
 * If the href is a reddit post permalink (absolute reddit.com URL or a
 * relative path) that matches the app's comments routes, return the
 * app-relative path for SPA navigation. Anything else (including /s/ share
 * links, user/subreddit links, external domains) returns null and stays an
 * external link.
 */
function getInternalPostPath(href: string): string | null {
  let url: URL;
  try {
    // Exclude protocol-relative hrefs ('//host/...') — they point at another
    // host, not a reddit-relative path.
    if (href.startsWith('/') && !href.startsWith('//')) {
      url = new URL(href, 'https://www.reddit.com');
    } else if (REDDIT_HOST_RE.test(href)) {
      url = new URL(href);
    } else {
      return null;
    }
  } catch {
    return null;
  }

  if (!isCommentsPath(url.pathname)) {
    return null;
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

const cleanLinks = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Rewrite reddit post permalinks to internal SPA links; set target and rel
  // on all other anchor tags; shorten long URL text
  doc.querySelectorAll('a').forEach((anchor) => {
    const internalPath = getInternalPostPath(anchor.getAttribute('href') ?? '');
    if (internalPath) {
      anchor.setAttribute('href', internalPath);
      anchor.removeAttribute('target');
      anchor.removeAttribute('rel');
      anchor.setAttribute('data-internal-link', '');
    } else {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
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

  const { listType } = useListingsFilter();
  const debug = useAppSelector((state) => state.siteSettings.debug);
  const navigate = useNavigate();
  const location = useLocation();
  const inOverlay = useIsOverlay();

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

  // Delegated click handler: SPA-navigate rewritten reddit post permalinks.
  // Modifier-clicks and non-primary buttons fall through to default behavior.
  useEffect(() => {
    const container = contentRef.current;
    if (!container) {
      return;
    }

    const handleClick = (event: MouseEvent): void => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }
      const anchor = target.closest('a[data-internal-link]');
      if (!anchor || !container.contains(anchor)) {
        return;
      }
      const href = anchor.getAttribute('href');
      if (!href) {
        return;
      }
      event.preventDefault();
      navigate(href, { state: buildDetailNavState(location, inOverlay) });
    };

    container.addEventListener('click', handleClick);
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [navigate, location, inOverlay]);

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
