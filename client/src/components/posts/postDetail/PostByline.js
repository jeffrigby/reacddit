import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import PostBylineAuthor from './PostBylineAuthor';

const PostByline = ({ data, kind }) => {
  const timeago = formatDistanceToNow(data.created_utc * 1000);
  // gotta be a better way to do this, but, whatever
  const timeagoshort = timeago
    .replace(/less than a minute?/g, '<1M')
    .replace(/seconds?/g, 'S')
    .replace(/minutes?/g, 'M')
    .replace(/hours?/g, 'H')
    .replace(/days?/g, 'D')
    .replace(/months?/g, 'MO')
    .replace(/years?/g, 'Y')
    .replace(/over/g, '>')
    .replace(/about/g, '')
    .replace(/almost/g, '')
    .replace(/ /g, '');

  const when = (
    <span>
      <i className="far fa-clock" /> {timeagoshort}
    </span>
  );

  const subUrl = `/r/${data.subreddit}`;
  const subredditInfo = (
    <Link to={{ pathname: subUrl, state: { showBack: true } }}>
      /r/{data.subreddit}
    </Link>
  );

  const commentCount = parseFloat(data.num_comments).toLocaleString('en');
  const comments = (
    <>
      <Link
        to={{
          pathname: data.permalink,
          state: {
            showBack: true,
          },
        }}
      >
        <i className="far fa-comment" /> {commentCount}
      </Link>
    </>
  );

  return (
    <>
      <PostBylineAuthor
        author={data.author}
        flair={data.author_flair_text}
        isSubmitter={data.is_submitter}
      />{' '}
      {when}{' '}
      {kind === 't3' && (
        <>
          {comments} {subredditInfo}{' '}
        </>
      )}
    </>
  );
};

PostByline.propTypes = {
  data: PropTypes.object.isRequired,
  kind: PropTypes.string.isRequired,
};

export default PostByline;
