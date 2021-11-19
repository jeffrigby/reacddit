import PropTypes from 'prop-types';
import Post from '../postDetail/Post';

/**
 * This is a component to render a listing of posts.
 * It's extracted so both comments and link post types can call it
 * @param posts - The list of posts from reddit
 * @param listType - The type of list to render.
 * @constructor
 */
function PostsRender({ posts, listType, idxOffset }) {
  const links = [];

  const renderPost = (post, idx) => {
    const { kind } = post;
    if (kind === 'more') {
      return null;
    }

    let duplicate = false;
    if (kind === 't3') {
      if (!links.includes(post.data.url) && listType !== 'duplicates') {
        links.push(post.data.url);
      } else {
        // This is a dupe
        duplicate = true;
      }
    }

    return (
      <Post
        postName={post.data.name}
        idx={idx}
        post={post}
        key={post.data.id}
        duplicate={duplicate}
      />
    );
  };

  let entries = null;
  const entriesKeys = Object.keys(posts);
  if (entriesKeys.length > 0) {
    entries = entriesKeys.map((key, idx) =>
      renderPost(posts[key], idx + idxOffset)
    );
  }

  return entries;
}

PostsRender.propTypes = {
  idxOffset: PropTypes.number,
  posts: PropTypes.object.isRequired,
  listType: PropTypes.string.isRequired,
};

PostsRender.defaultProps = {
  idxOffset: 0,
};

export default PostsRender;
