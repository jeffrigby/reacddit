import { memo, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { PostsContextData } from '../../../contexts';
import PostMeta from './PostMeta';
import PostDebug from './PostDebug';

function PostFooter({
  debug,
  renderedContent = null,
  setShowVisToggle,
  showVisToggle,
}) {
  const postContext = useContext(PostsContextData);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const { post, isLoaded } = postContext;
  const { data, kind } = post;

  const copyID = (comp) => {
    const id = comp.target.textContent;
    copy(id);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  const debugLinks = (
    <>
      <button
        className="btn btn-link shadow-none m-0 p-0 me-1"
        title="Click to copy"
        type="button"
        onClick={copyID}
      >
        {copied ? 'Copied' : data.name}
      </button>
      <button
        aria-label={showDebug ? 'Hide debug' : 'Show debug'}
        className="btn btn-link shadow-none m-0 p-0 me-1"
        title="Show debug!"
        type="button"
        onClick={() => setShowDebug(!showDebug)}
      >
        <i className="fas fa-code" />
      </button>
      <button
        aria-label={
          showVisToggle ? 'Hide Visibility Toggle' : 'Show Visibility Toggle'
        }
        className="btn btn-link shadow-none m-0 p-0 me-1"
        title="Show Visibility Toggle"
        type="button"
        onClick={() => setShowVisToggle(!showVisToggle)}
      >
        <i className={`fas ${showVisToggle ? 'fa-eye-slash' : 'fa-eye'}`} />
      </button>
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

  return (
    <>
      <footer className="d-flex clearfix align-middle mt-1">
        <div className="me-auto meta">{kind === 't3' && <PostMeta />}</div>
        <div>
          {debug && <span className="ps-3">{debugLinks}</span>}
          {!data.is_self && data.domain && (
            <Link
              to={{
                pathname: `/r/${data.subreddit}/search`,
                search: `?q=site:%22${data.domain}%22`,
                state: { showBack: true },
              }}
            >
              {data.domain}
            </Link>
          )}
        </div>
      </footer>
      {debug && showDebug && <PostDebug renderedContent={renderedContent} />}
    </>
  );
}

PostFooter.propTypes = {
  debug: PropTypes.bool.isRequired,
  renderedContent: PropTypes.object,
  showVisToggle: PropTypes.bool.isRequired,
  setShowVisToggle: PropTypes.func.isRequired,
};

export default memo(PostFooter);
