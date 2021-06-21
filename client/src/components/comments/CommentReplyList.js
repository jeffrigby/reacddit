import PropTypes from 'prop-types';
import { keyEntryChildren } from '../../common';
import CommentsRender from './CommentsRender';

function CommentReplyList({ replies, linkId }) {
  const keyedReplies = keyEntryChildren(replies);
  return (
    <CommentsRender
      listType="reply"
      posts={keyedReplies.data.children}
      linkId={linkId}
    />
  );
}

CommentReplyList.propTypes = {
  linkId: PropTypes.string.isRequired,
  replies: PropTypes.object.isRequired,
};

export default CommentReplyList;
