import PropTypes from 'prop-types';
import { keyEntryChildren } from '../../common';
import CommentsRender from './CommentsRender';

function CommentReplyList({ replies, linkId }) {
  const keyedReplies = keyEntryChildren(replies);
  return (
    <CommentsRender
      linkId={linkId}
      listType="reply"
      posts={keyedReplies.data.children}
    />
  );
}

CommentReplyList.propTypes = {
  linkId: PropTypes.string.isRequired,
  replies: PropTypes.object.isRequired,
};

export default CommentReplyList;
