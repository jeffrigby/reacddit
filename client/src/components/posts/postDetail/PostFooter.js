import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import copy from 'copy-to-clipboard';
import PostByline from './PostByline';
import { PostsContextData } from '../../../contexts';

const PostFooter = ({ debug, visible, toggleShowDebug }) => {
  const data = useContext(PostsContextData);
  const sticky = data.stickied || false;
  const [copied, setCopied] = useState(false);

  if (!visible) {
    return (
      <footer className="d-flex clearfix align-middle mt-1 offscreen-placeholder" />
    );
  }

  const crossPost =
    (data.crosspost_parent && data.crosspost_parent_list[0]) || false;

  if (data.crosspost_parent && !data.crosspost_parent_list[0]) {
    // This is weird and occasionally happens.
    // console.log(data);
  }

  const copyID = comp => {
    const id = comp.target.textContent;
    copy(id);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  return (
    <footer className="d-flex clearfix align-middle mt-1">
      <div className="mr-auto byline">
        <PostByline data={data} />
        {crossPost && (
          <>
            <i className="fas fa-random px-2" title="Crossposted" />{' '}
            <PostByline data={data.crosspost_parent_list[0]} />
          </>
        )}
        {sticky && <i className="fas fa-sticky-note px-2" title="Sticky" />}
      </div>
      <div>
        {debug && (
          <span className="pl-3">
            <button
              className="btn btn-link m-0 p-0 mr-1"
              onClick={copyID}
              title="Click to copy"
              type="button"
            >
              {copied ? 'Copied' : data.name}
            </button>
            <Link
              to={`/r/${
                data.subreddit
              }/search?q=${`title:'${data.title}' author:${data.author}`}`}
              title="Isolate this entry for debugging"
              className="m-0 mr-1 p-0"
            >
              <i className="fas fa-search" />
            </Link>
            <button
              className="btn btn-link m-0 p-0 mr-1"
              onClick={() => toggleShowDebug()}
              title="Show debug"
              type="button"
            >
              <i className="fas fa-code" />
            </button>
          </span>
        )}
        {!data.is_self && (
          <Link to={`/r/${data.subreddit}/search?q=site:%22${data.domain}%22`}>
            {data.domain}
          </Link>
        )}
      </div>
    </footer>
  );
};

PostFooter.propTypes = {
  debug: PropTypes.bool.isRequired,
  toggleShowDebug: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default React.memo(PostFooter);
