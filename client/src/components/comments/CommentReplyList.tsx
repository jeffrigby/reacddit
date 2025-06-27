import type {
  Thing,
  Listing,
  CommentData,
  MoreChildrenData,
} from '@/types/redditApi';
import { keyEntryChildren } from '@/common';
import CommentsRender from './CommentsRender';

interface CommentReplyListProps {
  linkId: string;
  replies: Listing<CommentData | MoreChildrenData>;
}

interface KeyedReplies {
  data: {
    children: Record<string, Thing<CommentData> | Thing<MoreChildrenData>>;
  };
}

function CommentReplyList({ replies, linkId }: CommentReplyListProps) {
  const keyedReplies = keyEntryChildren(replies) as KeyedReplies;
  return (
    <CommentsRender
      linkId={linkId}
      listType="reply"
      posts={keyedReplies.data.children}
    />
  );
}

export default CommentReplyList;
