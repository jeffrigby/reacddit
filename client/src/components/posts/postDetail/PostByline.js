import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import PostBylineAuthor from './PostBylineAuthor';

const PostByline = ({ data }) => {
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
    <>
      <i className="far fa-clock" /> {timeagoshort}
    </>
  );

  const subUrl = `/r/${data.subreddit}`;
  const subredditInfo = <Link to={subUrl}>/r/{data.subreddit}</Link>;

  const commentCount = parseFloat(data.num_comments).toLocaleString('en');
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
    <>
      <span className="pr-1">
        <PostBylineAuthor author={data.author} flair={data.author_flair_text} />{' '}
      </span>
      <span className="pr-1">{when}</span>
      <span className="pr-1">{comments}</span>
      <span className="pr-1">{subredditInfo}</span>
    </>
  );
};

PostByline.propTypes = {
  data: PropTypes.object.isRequired,
};

export default PostByline;
