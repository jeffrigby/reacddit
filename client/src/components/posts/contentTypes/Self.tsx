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
import SelfInline from './SelfInline';
import type { EmbedContent } from '../embeds/types';
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

interface Dimensions {
  self?: number;
  selfHTML?: number;
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

  const [showAll, setShowAll] = useState(
    content ? (content.expand ?? false) : false
  );
  const [specs, setSpecs] = useState<Dimensions | null>(null);

  const listType = useAppSelector(
    (state) => state.listings.currentFilter.listType
  );
  const debug = useAppSelector((state) => state.siteSettings.debugMode);
  const selfRef = useRef<HTMLDivElement>(null);
  const selfHTMLRef = useRef<HTMLDivElement>(null);

  const { post } = postContext;

  // Optimized height calculation to avoid forced reflows
  // Using ResizeObserver instead of resize listener + throttle
  const getHeights = useCallback(() => {
    // Batch layout reads in requestAnimationFrame to avoid forced reflows
    requestAnimationFrame(() => {
      const dimensions: Dimensions = {};
      if (selfRef.current) {
        dimensions.self = selfRef.current.getBoundingClientRect().height;
      }

      if (selfHTMLRef.current) {
        dimensions.selfHTML = selfHTMLRef.current.scrollHeight;
      }
      setSpecs(dimensions);
    });
  }, []);

  useEffect(() => {
    getHeights();

    // Use ResizeObserver instead of window resize listener for better performance
    const resizeObserver = new ResizeObserver(getHeights);
    if (selfRef.current) {
      resizeObserver.observe(selfRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [getHeights]);

  const toggleShow = useCallback(() => {
    if (content.expand) {
      return;
    }
    setShowAll((prevShowAll) => !prevShowAll);
  }, [content.expand]);

  if (!content) {
    return null;
  }

  const { html } = content;
  if (!html) {
    return null;
  }
  const rawhtml = cleanLinks(html);

  const renderedHTML = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;
  const inlineRendered =
    content.inline.length && content.inlineLinks ? (
      <SelfInline
        inline={content.inline}
        inlineLinks={content.inlineLinks}
        name={name}
      />
    ) : null;

  const showMore =
    specs?.selfHTML && specs.self && specs.selfHTML - specs.self > 10;
  const selfHTMLClasses = classNames('self-html', {
    'self-fade': showMore && !showAll,
    'sf-html-show-all': showAll,
  });

  const buttonIcon = !showAll ? faAngleDoubleDown : faAngleDoubleUp;
  const buttonText = !showAll ? 'Read More' : 'Collapse';

  return (
    <div className={`self self-${post.kind} self-${post.kind}-${listType}`}>
      <div ref={selfRef}>
        <div className={selfHTMLClasses} ref={selfHTMLRef}>
          {renderedHTML}
        </div>
        {showMore && (
          <div className="self-show-more">
            <Button
              className="shadow-none p-0"
              size="sm"
              title="Load More"
              variant="link"
              onClick={toggleShow}
            >
              <FontAwesomeIcon icon={buttonIcon} /> {buttonText}
            </Button>
          </div>
        )}
      </div>
      {inlineRendered}
      {debug && specs && (
        <code>
          Self Height: {specs.self}px
          <br />
          selfHTML Height: {specs.selfHTML}px
        </code>
      )}
    </div>
  );
}

export default Self;
