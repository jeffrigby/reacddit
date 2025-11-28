import type { MouseEvent } from 'react';
import { memo, useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import copy from 'copy-to-clipboard';
import { PostsContextData } from '@/contexts';
import type { LinkData, CommentData } from '@/types/redditApi';
import type { EmbedContent } from '@/components/posts/embeds/types';
import PostMeta from './PostMeta';
import PostDebug from './PostDebug';

interface PostFooterProps {
  debug: boolean;
  renderedContent?: EmbedContent;
  setShowVisToggle: (show: boolean) => void;
  showVisToggle: boolean;
}

function PostFooter({
  debug,
  renderedContent,
  setShowVisToggle,
  showVisToggle,
}: PostFooterProps): React.JSX.Element | null {
  const postContext = useContext(PostsContextData) as {
    post: { data: LinkData | CommentData; kind: string };
    isLoaded: boolean;
  };
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const { post, isLoaded } = postContext;
  const { data, kind } = post;
  const copyTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const copyID = (comp: MouseEvent<HTMLButtonElement>): void => {
    const id = comp.currentTarget.textContent || '';
    const success = copy(id);

    if (success) {
      setCopied(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 500);
    } else {
      console.error('Failed to copy to clipboard');
    }
  };

  const debugLinks = (
    <>
      <Button
        className="shadow-none m-0 p-0 me-1"
        title="Click to copy"
        variant="link"
        onClick={copyID}
      >
        {copied ? 'Copied' : data.name}
      </Button>
      <Button
        aria-label={showDebug ? 'Hide debug' : 'Show debug'}
        className="shadow-none m-0 p-0 me-1"
        title="Show debug!"
        variant="link"
        onClick={() => setShowDebug(!showDebug)}
      >
        <FontAwesomeIcon icon={faCode} />
      </Button>
      <Button
        aria-label={
          showVisToggle ? 'Hide Visibility Toggle' : 'Show Visibility Toggle'
        }
        className="shadow-none m-0 p-0 me-1"
        title="Show Visibility Toggle"
        variant="link"
        onClick={() => setShowVisToggle(!showVisToggle)}
      >
        <FontAwesomeIcon icon={showVisToggle ? faEyeSlash : faEye} />
      </Button>
    </>
  );

  if (kind === 't1') {
    return debug ? (
      <>
        <footer className="d-flex clearfix align-middle mb-1">
          <div>{debugLinks}</div>
        </footer>
        {debug && showDebug && renderedContent && (
          <PostDebug renderedContent={renderedContent} />
        )}
      </>
    ) : null;
  }

  if (!isLoaded) {
    return (
      <footer className="d-flex clearfix align-middle mt-1 offscreen-placeholder" />
    );
  }

  const linkData = data as LinkData;

  return (
    <>
      <footer className="d-flex clearfix align-middle mt-1">
        <div className="me-auto meta">{kind === 't3' && <PostMeta />}</div>
        <div>
          {debug && <span className="ps-3">{debugLinks}</span>}
          {!linkData.is_self && linkData.domain && (
            <Link
              state={{ showBack: true }}
              to={`/r/${linkData.subreddit}/search?q=site:%22${linkData.domain}%22`}
            >
              {linkData.domain}
            </Link>
          )}
        </div>
      </footer>
      {debug && showDebug && <PostDebug renderedContent={renderedContent} />}
    </>
  );
}

export default memo(PostFooter);
