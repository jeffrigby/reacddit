import PropTypes from 'prop-types';
import PostBylineAuthor from './PostBylineAuthor';
import PostTimeAgo from './PostTimeAgo';
import PostSubLink from './PostSubLink';
import PostCommentLink from './PostCommentLink';

const PostByline = ({ data, kind }) => {
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
      <span className="pe-2">
        <PostBylineAuthor
          author={author}
          flair={flair}
          isSubmitter={isSubmitter}
        />
      </span>
      <span className="pe-2">
        <PostTimeAgo createdUtc={createdUtc} />
      </span>
      {kind === 't3' && (
        <>
          <span className="pe-2">
            <PostCommentLink numComments={numComments} permalink={permalink} />
          </span>
          <PostSubLink subreddit={subreddit} />
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
