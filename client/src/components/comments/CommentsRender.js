import PropTypes from 'prop-types';
import Post from '../posts/postDetail/Post';
// eslint-disable-next-line import/no-cycle
import CommentsMore from './CommentsMore';

function CommentsRender({ posts, listType, linkId }) {
  const renderComment = (comment, idx) => {
    if (comment.kind === 'more') {
      return (
        <CommentsMore
          key={comment.data.id}
          linkId={linkId}
          moreList={comment}
        />
      );
    }

    return (
      <Post
        duplicate={false}
        idx={idx}
        key={comment.data.id}
        post={comment}
        postName={comment.data.name}
      />
    );
  };

  let comments;
  const entriesKeys = Object.keys(posts);
  if (entriesKeys.length > 0) {
    comments = entriesKeys.map((key, idx) => renderComment(posts[key], idx));
  }

  return comments;
}

CommentsRender.propTypes = {
  linkId: PropTypes.string.isRequired,
  posts: PropTypes.object.isRequired,
  listType: PropTypes.string.isRequired,
};

export default CommentsRender;
