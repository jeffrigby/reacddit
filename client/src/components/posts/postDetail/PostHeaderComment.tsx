import type { MouseEvent, KeyboardEvent } from 'react';
import { memo } from 'react';
import PostExpandContract from '@/components/posts/postActions/PostExpandContract';
import PostVote from '@/components/posts/postActions/PostVote';
import PostSave from '@/components/posts/postActions/PostSave';
import PostMeta from './PostMeta';

interface PostHeaderCommentProps {
  expand: boolean;
  toggleView: (event: MouseEvent | KeyboardEvent) => void;
}

function PostHeaderComment({
  expand,
  toggleView,
}: PostHeaderCommentProps): React.JSX.Element {
  return (
    <header className="d-flex">
      <div className="me-2 post-action-expand">
        <PostExpandContract expand={expand} kind="t1" toggleView={toggleView} />
      </div>
      <div className="me-auto comment-meta meta">
        <PostMeta />
      </div>
      <div className="text-nowrap align-middle d-flex actions">
        <PostVote />
        <PostSave />
      </div>
    </header>
  );
}

export default memo(PostHeaderComment);
