import { useMemo } from 'react';
import PropTypes from 'prop-types';
import Post from '../postDetail/Post';

/**
 * This is a component to render a listing of posts.
 * It's extracted so both comments and link post types can call it
 * @param posts {object} - The list of posts from reddit
 * @param listType {string} - The type of list to render.
 * @param idxOffset {number} - The offset to use for the index of the post
 * @constructor
 */
function PostsRender({ posts, listType, idxOffset = 0 }) {
  return useMemo(() => {
    const links = new Set();

    // Remove the "more" posts
    const filteredPosts = Object.values(posts).filter(
      (post) => post.kind !== 'more'
    );

    // Render the posts and find duplicates
    return filteredPosts.map((post, idx) => {
      const {
        kind,
        data: { name, id, url },
      } = post;

      let duplicate = false;
      if (kind === 't3' && listType !== 'duplicates') {
        if (!links.has(url)) {
          links.add(url);
        } else {
          duplicate = true;
        }
      }

      return (
        <Post
          duplicate={duplicate}
          idx={idx + idxOffset}
          key={id}
          post={post}
          postName={name}
        />
      );
    });
  }, [posts, listType, idxOffset]);
}

PostsRender.propTypes = {
  idxOffset: PropTypes.number,
  posts: PropTypes.object.isRequired,
  listType: PropTypes.string.isRequired,
};

export default PostsRender;
