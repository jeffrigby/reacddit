import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Post from '../postDetail/Post';

/**
 * This is a component to render the comment links
 * @param permalink {string} - The permalink of the post
 * @param comment {string} - The comment id
 * @returns {JSX.Element} - Rendered comment links
 */
function renderCommentLinks(permalink, comment) {
  const parentCommentLink = `${permalink}${comment}/`;
  const search = {
    context: 8,
    depth: 9,
  };
  return (
    <div className="list-actions">
      <Link to={{ pathname: permalink, state: { showBack: true } }}>
        View all comments
      </Link>{' '}
      <Link
        to={{
          pathname: parentCommentLink,
          search: `?${new URLSearchParams(search).toString()}`,
          state: { showBack: true },
        }}
      >
        Show parent comments
      </Link>
    </div>
  );
}

/**
 * This is a component to render the parent post for comments and duplicates
 * @param post {object} - The post object
 * @returns {JSX.Element|null} - Rendered parent post or null if not needed
 * @constructor
 */
const PostsParent = ({ post }) => {
  const listingsFilter = useSelector((state) => state.listingsFilter);
  const { listType, comment } = listingsFilter;

  const shouldRenderParent = post && listType.match(/duplicates|comments/);

  const parentPost = useMemo(() => {
    if (!shouldRenderParent) {
      return null;
    }

    const {
      data: { name, id },
    } = post;

    return (
      <Post
        parent
        duplicate={false}
        idx={0}
        key={id}
        post={post}
        postName={name}
      />
    );
  }, [post, shouldRenderParent]);

  const commentLinks = useMemo(() => {
    if (!shouldRenderParent || !comment) {
      return null;
    }

    const {
      data: { permalink },
    } = post;

    return renderCommentLinks(permalink, comment);
  }, [post, comment, shouldRenderParent]);

  if (!shouldRenderParent) {
    return null;
  }

  let subhead;
  if (listType === 'comments') {
    subhead = comment ? 'Comment Thread' : 'Comments';
  } else {
    subhead = 'Duplicate/Cross Posts';
  }

  return (
    <>
      {parentPost}
      <div className="list-title">
        {subhead} {commentLinks}
      </div>
    </>
  );
};

PostsParent.propTypes = {
  post: PropTypes.object.isRequired,
};

export default memo(PostsParent);
