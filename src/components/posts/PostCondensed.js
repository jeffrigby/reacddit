import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PostVote from './PostVote';
import PostSave from './PostSave';

const PostCondensed = ({
  timeago,
  data,
  focused,
  sticky,
  expand,
  commentCount,
  authorFlair,
}) => {
  let classes = 'entry list-group-item condensed d-flex';
  if (focused) {
    classes += ' focused';
  }

  // gotta be a better way to do this, but, whatever, sticking with timeago for now.
  const timeagoshort = timeago
    .replace(' ago', '')
    .replace(/^a|^an/, '1')
    .replace(/seconds?/g, 'S')
    .replace(/minutes?/g, 'M')
    .replace(/hours?/g, 'H')
    .replace(/days?/g, 'D')
    .replace(/months?/g, 'M')
    .replace(/years?/g, 'Y')
    .replace(' ', '');

  const author = (
    <>
      by <Link to={`/user/${data.author}/submitted/new`}>{data.author}</Link>
      {authorFlair}
    </>
  );

  const to = (
    <>
      to <Link to={`/r/${data.subreddit}`}>/r/{data.subreddit}</Link>
    </>
  );

  const comments = (
    <>
      <a
        href={`https://www.reddit.com${data.permalink}`}
        rel="noopener noreferrer"
        target="_blank"
      >
        <i className="far fa-comment" /> {commentCount}
      </a>
    </>
  );

  return (
    <div className={classes} key={data.name} id={data.name}>
      <div className="">
        <header>
          <button
            onClick={expand}
            className="btn btn-link btn-sm m-0 p-0 post-title"
            type="button"
          >
            <h6 className="p-0 m-0">{data.title}</h6>
          </button>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="list-group-item-heading"
            title="Open link in new tab"
          >
            {' '}
            <i className="fas fa-link direct-link" />
          </a>
        </header>
        <footer className="clearfix align-middle">
          {sticky && (
            <span className="pr-2">
              <i className="fas fa-sticky-note" title="Sticky" />
            </span>
          )}
          {comments} <i className="far fa-clock" /> {timeagoshort} {author} {to}{' '}
          {data.domain}
        </footer>
      </div>
      <div />
      <div className="text-nowrap d-flex actions ml-auto">
        <PostVote id={data.id} likes={data.likes} ups={data.ups} />
        <PostSave name={data.name} saved={data.saved} />
        <div>
          <button
            onClick={expand}
            type="button"
            className="btn btn-link btn-sm m-0 p-0"
          >
            <i className="fas fa-expand-arrows-alt" />
          </button>
        </div>
      </div>
    </div>
  );
};

PostCondensed.propTypes = {
  timeago: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  focused: PropTypes.bool.isRequired,
  sticky: PropTypes.bool.isRequired,
  expand: PropTypes.func.isRequired,
  commentCount: PropTypes.string.isRequired,
  authorFlair: PropTypes.object,
};

PostCondensed.defaultProps = {
  authorFlair: null,
};

export default PostCondensed;
