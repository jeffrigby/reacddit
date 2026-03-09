import type { ReactElement } from 'react';
import type { Thing, CommentData, MoreChildrenData } from '@/types/redditApi';
import Post from '@/components/posts/postDetail/Post';
import CommentsMore from './CommentsMore';

type CommentOrMore = Thing<CommentData> | Thing<MoreChildrenData>;

interface CommentsRenderProps {
  linkId: string;
  posts: Record<string, CommentOrMore>;
}

function CommentsRender({
  posts,
  linkId,
}: CommentsRenderProps): ReactElement[] | null {
  const entriesKeys = Object.keys(posts);
  if (entriesKeys.length === 0) {
    return null;
  }

  return entriesKeys.map((key, idx) => {
    const comment = posts[key];
    if (comment.kind === 'more') {
      return (
        <CommentsMore
          key={comment.data.id}
          linkId={linkId}
          moreList={comment as Thing<MoreChildrenData>}
        />
      );
    }

    return (
      <Post
        duplicate={false}
        idx={idx}
        key={comment.data.id}
        post={comment as Thing<CommentData>}
        postName={comment.data.name}
      />
    );
  });
}

export default CommentsRender;
