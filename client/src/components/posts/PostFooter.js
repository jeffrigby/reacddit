import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PostByline from './PostByline';
import { PostsContextData } from '../../contexts';

const PostFooter = ({ debug, visible, toggleShowDebug }) => {
  const data = useContext(PostsContextData);
  const sticky = data.stickied || false;

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

  return (
    <footer className="d-flex clearfix align-middle mt-1">
      {' '}
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
            {data.name}{' '}
            <button
              className="btn btn-link m-0 p-0"
              onClick={() => toggleShowDebug()}
              title="Show debug"
              type="button"
            >
              <i className="fas fa-code" />
            </button>{' '}
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
