import PostVote from '@/components/posts/postActions/PostVote';
import PostSave from '@/components/posts/postActions/PostSave';

/** The vote and save controls a comment header carries on its right. */
function PostCommentActions(): React.JSX.Element {
  return (
    <div className="text-nowrap align-middle d-flex actions">
      <PostVote />
      <PostSave />
    </div>
  );
}

export default PostCommentActions;
