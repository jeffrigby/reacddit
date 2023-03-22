import PropTypes from 'prop-types';
import PostBylineAuthor from './PostBylineAuthor';
import PostTimeAgo from './PostTimeAgo';
import PostSubLink from './PostSubLink';
import PostCommentLink from './PostCommentLink';

function PostByline({ data, kind }) {
  const {
    author,
    author_flair_text: flair,
    created_utc: createdUtc,
    is_submitter: isSubmitter,
    num_comments: numComments,
    permalink,
    subreddit,
  } = data;

  return (
    <>
      <PostBylineAuthor
        author={author}
        flair={flair}
        isSubmitter={isSubmitter}
      />{' '}
      <PostTimeAgo createdUtc={createdUtc} />{' '}
      {kind === 't3' && (
        <>
          <PostCommentLink numComments={numComments} permalink={permalink} />{' '}
          <PostSubLink subreddit={subreddit} />
        </>
      )}
    </>
  );
}

PostByline.propTypes = {
  data: PropTypes.object.isRequired,
  kind: PropTypes.string.isRequired,
};

export default PostByline;
