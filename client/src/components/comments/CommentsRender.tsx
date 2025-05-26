import type { ReactElement } from 'react';
import type { Thing, CommentData, MoreChildrenData } from '@/types/redditApi';
import Post from '../posts/postDetail/Post';
import CommentsMore from './CommentsMore';

type CommentOrMore = Thing<CommentData> | Thing<MoreChildrenData>;

interface CommentsRenderProps {
  linkId: string;
  posts: Record<string, CommentOrMore>;
  listType: string;
}

function CommentsRender({
  posts,
  listType,
  linkId,
}: CommentsRenderProps): ReactElement[] | null {
  const renderComment = (comment: CommentOrMore, idx: number): ReactElement => {
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

  let comments: ReactElement[] | null = null;
  const entriesKeys = Object.keys(posts);
  if (entriesKeys.length > 0) {
    comments = entriesKeys.map((key, idx) => renderComment(posts[key], idx));
  }

  return comments;
}

export default CommentsRender;
