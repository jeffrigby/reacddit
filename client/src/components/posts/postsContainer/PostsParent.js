import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Post from '../postDetail/Post';

const PostsParent = ({ post }) => {
  const listingsFilter = useSelector((state) => state.listingsFilter);
  const { listType, comment } = listingsFilter;

  if (post && listType.match(/duplicates|comments/)) {
    const parentPost = (
      <Post
        postName={post.data.name}
        post={post}
        key={post.data.id}
        duplicate={false}
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
      const parentCommentLink = `${post.data.permalink}${comment}/?context=8&depth=9`;
      commentLinks = (
        <div className="list-actions">
          <Link to={post.data.permalink}>View all comments</Link>{' '}
          <Link to={parentCommentLink}>Show parent comments</Link>
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

  return <></>;
};

PostsParent.propTypes = {
  post: PropTypes.object.isRequired,
};

export default React.memo(PostsParent);
