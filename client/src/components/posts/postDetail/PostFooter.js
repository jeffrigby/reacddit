import { memo, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { PostsContextData } from '../../../contexts';
import PostMeta from './PostMeta';
import PostDebug from './PostDebug';

function PostFooter({
  debug,
  renderedContent,
  setShowVisToggle,
  showVisToggle,
}) {
  const postContext = useContext(PostsContextData);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data, kind } = postContext.post;

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
        onClick={copyID}
        title="Click to copy"
        type="button"
      >
        {copied ? 'Copied' : data.name}
      </button>
      <button
        className="btn btn-link shadow-none m-0 p-0 me-1"
        onClick={() => setShowDebug(!showDebug)}
        title="Show debug!"
        type="button"
      >
        <i className="fas fa-code" />
      </button>
      <button
        className="btn btn-link shadow-none m-0 p-0 me-1"
        onClick={() => setShowVisToggle(!showVisToggle)}
        title="Show Visibility Toggle"
        type="button"
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

  if (!postContext.isLoaded) {
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

PostFooter.defaultProps = {
  renderedContent: null,
};

export default memo(PostFooter);
