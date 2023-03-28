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
function PostsParent({ post }) {
  const listingsFilter = useSelector((state) => state.listingsFilter);
  const { listType, comment } = listingsFilter;

  if (post && listType.match(/duplicates|comments/)) {
    const {
      data: { permalink, name, id },
    } = post;

    const parentPost = useMemo(
      () => (
        <Post
          postName={name}
          post={post}
          key={id}
          duplicate={false}
          parent
          idx={0}
        />
      ),
      [post, name, id]
    );

    let subhead;
    if (listType === 'comments') {
      subhead = comment ? 'Comment Thread' : 'Comments';
    } else {
      subhead = 'Duplicate/Cross Posts';
    }

    const commentLinks = useMemo(
      () => (comment ? renderCommentLinks(permalink, comment) : null),
      [permalink, comment]
    );

    return (
      <>
        {parentPost}
        <div className="list-title">
          {subhead} {commentLinks}
        </div>
      </>
    );
  }

  return null;
}

PostsParent.propTypes = {
  post: PropTypes.object.isRequired,
};

export default memo(PostsParent);
