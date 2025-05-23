import { memo } from 'react';
import PropTypes from 'prop-types';
import PostExpandContract from '../postActions/PostExpandContract';
import PostMeta from './PostMeta';
import PostVote from '../postActions/PostVote';
import PostSave from '../postActions/PostSave';

function PostHeaderComment({ expand, toggleView }) {
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

PostHeaderComment.propTypes = {
  toggleView: PropTypes.func.isRequired,
  expand: PropTypes.bool.isRequired,
};

export default memo(PostHeaderComment);
