import type { ReactElement } from 'react';
import { useMemo } from 'react';
import type { Thing, LinkData, CommentData } from '../../../types/redditApi';
import Post from '../postDetail/Post';

interface PostsRenderProps {
  posts: Record<string, Thing<LinkData | CommentData>>;
  listType: string;
  idxOffset?: number;
}

/**
 * This is a component to render a listing of posts.
 * It's extracted so both comments and link post types can call it
 */
function PostsRender({
  posts,
  listType,
  idxOffset = 0,
}: PostsRenderProps): ReactElement[] {
  return useMemo(() => {
    const links = new Set<string>();

    // Remove the "more" posts
    const filteredPosts = Object.values(posts).filter(
      (post) => post.kind !== 'more'
    );

    // Render the posts and find duplicates
    return filteredPosts.map((post, idx) => {
      const {
        kind,
        data: { name, id },
      } = post;

      let duplicate = false;
      if (kind === 't3' && listType !== 'duplicates') {
        const linkData = post.data as LinkData;
        if (!links.has(linkData.url)) {
          links.add(linkData.url);
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

export default PostsRender;
