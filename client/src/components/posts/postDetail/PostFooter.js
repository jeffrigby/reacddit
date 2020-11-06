import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import { PostsContextData } from '../../../contexts';
import PostMeta from './PostMeta';
import PostDebug from './PostDebug';

const PostFooter = ({ debug, visible, renderedContent }) => {
  const post = useContext(PostsContextData);
  const [showDebug, setShowDebug] = useState(false);
  const [copied, setCopied] = useState(false);
  const { data, kind } = post;

  const copyID = (comp) => {
    const id = comp.target.textContent;
    copy(id);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  if (kind === 't1') {
    return (
      <>
        {debug && (
          <>
            <footer className="d-flex clearfix align-middle mb-1">
              <div>
                <button
                  className="btn btn-link shadow-none m-0 p-0 mr-1"
                  onClick={copyID}
                  title="Click to copy"
                  type="button"
                >
                  {copied ? 'Copied' : data.name}
                </button>
                <button
                  className="btn btn-link shadow-none m-0 p-0 mr-1"
                  onClick={() => setShowDebug(!showDebug)}
                  title="Show debug"
                  type="button"
                >
                  <i className="fas fa-code" />
                </button>
              </div>
            </footer>
            {debug && showDebug && renderedContent && (
              <PostDebug renderedContent={renderedContent} />
            )}
          </>
        )}
      </>
    );
  }

  if (!visible) {
    return (
      <footer className="d-flex clearfix align-middle mt-1 offscreen-placeholder" />
    );
  }

  return (
    <>
      <footer className="d-flex clearfix align-middle mt-1">
        <div className="mr-auto meta">{kind === 't3' && <PostMeta />}</div>
        <div>
          {debug && (
            <span className="pl-3">
              <button
                className="btn btn-link shadow-none m-0 p-0 mr-1"
                onClick={copyID}
                title="Click to copy"
                type="button"
              >
                {copied ? 'Copied' : data.name}
              </button>
              <button
                className="btn btn-link shadow-none m-0 p-0 mr-1"
                onClick={() => setShowDebug(!showDebug)}
                title="Show debug"
                type="button"
              >
                <i className="fas fa-code" />
              </button>
            </span>
          )}
          {!data.is_self && data.domain && (
            <Link
              to={`/r/${data.subreddit}/search?q=site:%22${data.domain}%22`}
            >
              {data.domain}
            </Link>
          )}
        </div>
      </footer>
      {debug && showDebug && renderedContent && (
        <PostDebug renderedContent={renderedContent} />
      )}
    </>
  );
};

PostFooter.propTypes = {
  debug: PropTypes.bool.isRequired,
  renderedContent: PropTypes.object,
  visible: PropTypes.bool.isRequired,
};

PostFooter.defaultProps = {
  renderedContent: null,
};

export default React.memo(PostFooter);
