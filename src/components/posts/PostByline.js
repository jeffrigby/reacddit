import React from 'react';
import PropTypes from 'prop-types';
import * as moment from 'moment';
import { Link } from 'react-router-dom';

const PostByline = ({ data }) => {
  const timeago = moment(data.created_utc * 1000).from();
  // gotta be a better way to do this, but, whatever, sticking with moment for now.
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

  const when = (
    <>
      <i className="far fa-clock" /> {timeagoshort}
    </>
  );

  const authorFlair = data.author_flair_text ? (
    <span className="badge badge-dark">{data.author_flair_text}</span>
  ) : null;

  const authorLink = (
    <>
      <Link to={`/user/${data.author}/submitted/new`}>
        <i className="fas fa-user" /> {data.author}
      </Link>{' '}
      {authorFlair}
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
      <span className="pr-1">{authorLink}</span>
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
