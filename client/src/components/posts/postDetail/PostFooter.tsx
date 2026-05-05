import type { MouseEvent } from 'react';
import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { usePostContext } from '@/contexts';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import type { LinkData } from '@/types/redditApi';
import type { EmbedContent } from '@/components/posts/embeds/types';
import PostMeta from './PostMeta';
import PostDebug from './PostDebug';

interface PostFooterProps {
  debug: boolean;
  renderedContent?: EmbedContent | null;
  setShowVisToggle: (show: boolean) => void;
  showVisToggle: boolean;
}

function PostFooter({
  debug,
  renderedContent,
  setShowVisToggle,
  showVisToggle,
}: PostFooterProps): React.JSX.Element | null {
  const postContext = usePostContext();
  const [showDebug, setShowDebug] = useState(false);
  const { copied, error: copyError, copy } = useCopyToClipboard(500);
  const { post, isLoaded } = postContext;
  const { data, kind } = post;

  const copyID = (comp: MouseEvent<HTMLButtonElement>): void => {
    const id = comp.currentTarget.textContent || '';
    copy(id);
  };

  const status: 'error' | 'copied' | 'idle' = copyError
    ? 'error'
    : copied
      ? 'copied'
      : 'idle';
  const view = {
    idle: { label: data.name, title: 'Click to copy' },
    copied: { label: 'Copied', title: 'Click to copy' },
    error: {
      label: 'Copy failed',
      title: `Copy failed: ${copyError?.message ?? ''}`,
    },
  }[status];

  const debugLinks = (
    <>
      <Button
        className="shadow-none m-0 p-0 me-1"
        title={view.title}
        variant="link"
        onClick={copyID}
      >
        {view.label}
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
