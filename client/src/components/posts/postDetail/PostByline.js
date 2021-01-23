import React from 'react';
import PropTypes from 'prop-types';
import PostBylineAuthor from './PostBylineAuthor';
import PostTimeAgo from './PostTimeAgo';
import PostSubLink from './PostSubLink';
import PostCommentLink from './PostCommentLink';

const PostByline = ({ data, kind }) => (
  <>
    <PostBylineAuthor
      author={data.author}
      flair={data.author_flair_text}
      isSubmitter={data.is_submitter}
    />{' '}
    <PostTimeAgo createdUtc={data.created_utc} />{' '}
    {kind === 't3' && (
      <>
        <PostCommentLink
          numComments={data.num_comments}
          permalink={data.permalink}
        />{' '}
        <PostSubLink subreddit={data.subreddit} />
      </>
    )}
  </>
);

PostByline.propTypes = {
  data: PropTypes.object.isRequired,
  kind: PropTypes.string.isRequired,
};

export default PostByline;
