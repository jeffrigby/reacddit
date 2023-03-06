import { memo } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Post from '../postDetail/Post';

function PostsParent({ post }) {
  const listingsFilter = useSelector((state) => state.listingsFilter);
  const { listType, comment } = listingsFilter;

  if (post && listType.match(/duplicates|comments/)) {
    const parentPost = (
      <Post
        postName={post.data.name}
        post={post}
        key={post.data.id}
        duplicate={false}
        parent
        idx={0}
      />
    );

    let subhead;
    if (listType === 'comments') {
      subhead = comment ? 'Comment Thread' : 'Comments';
    } else {
      subhead = 'Duplicate/Cross Posts';
    }

    let commentLinks;
    if (comment) {
      const parentCommentLink = `${post.data.permalink}${comment}/`;
      const search = {
        context: 8,
        depth: 9,
      };
      commentLinks = (
        <div className="list-actions">
          <Link
            to={{ pathname: post.data.permalink, state: { showBack: true } }}
          >
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
