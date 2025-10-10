import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../../../types/redux';
import type { Thing, LinkData, CommentData } from '../../../types/redditApi';
import Post from '../postDetail/Post';

interface PostsParentProps {
  post: Thing<LinkData | CommentData>;
}

/**
 * This is a component to render the comment links
 */
function renderCommentLinks(
  permalink: string,
  comment: string
): ReactElement | null {
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
          search: `?${new URLSearchParams(search as Record<string, string>).toString()}`,
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
 */
function PostsParent({ post }: PostsParentProps): ReactElement | null {
  const listingsFilter = useSelector(
    (state: RootState) => state.listingsFilter
  );
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

  let subhead: string;
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
}

export default memo(PostsParent);
