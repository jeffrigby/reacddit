import type {
  Thing,
  Listing,
  CommentData,
  MoreChildrenData,
} from '@/types/redditApi';
import CommentsRender from './CommentsRender';

type CommentOrMore = Thing<CommentData> | Thing<MoreChildrenData>;

interface CommentReplyListProps {
  linkId: string;
  replies: Listing<CommentData | MoreChildrenData>;
}

function CommentReplyList({ replies, linkId }: CommentReplyListProps) {
  // Convert array to keyed object
  const keyedReplies = replies.data.children.reduce<
    Record<string, CommentOrMore>
  >(
    (acc, item) => ({
      ...acc,
      [item.data.name]: item as CommentOrMore,
    }),
    {}
  );

  return (
    <CommentsRender linkId={linkId} listType="reply" posts={keyedReplies} />
  );
}

export default CommentReplyList;
