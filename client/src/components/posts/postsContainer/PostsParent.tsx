import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router';
import { useListingsFilter, useIsOverlay } from '@/contexts';
import { buildDetailNavState } from '@/utils/navigationState';
import type { NavState } from '@/types/navigation';
import type { Thing, LinkData, CommentData } from '@/types/redditApi';
import Post from '@/components/posts/postDetail/Post';

interface PostsParentProps {
  post: Thing<LinkData | CommentData>;
}

/**
 * This is a component to render the comment links
 */
function renderCommentLinks(
  permalink: string,
  comment: string,
  navState: NavState
): ReactElement | null {
  const parentCommentLink = `${permalink}${comment}/`;
  const search = {
    context: '8',
    depth: '9',
  };
  return (
    <div className="list-actions">
      <Link state={navState} to={permalink}>
        View all comments
      </Link>{' '}
      <Link
        state={navState}
        to={`${parentCommentLink}?${new URLSearchParams(search).toString()}`}
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
  const listingsFilter = useListingsFilter();
  const location = useLocation();
  const inOverlay = useIsOverlay();
  const { listType, comment } = listingsFilter;

  // Memoize regex match to prevent re-execution on every render
  const shouldRenderParent = useMemo(
    () => post && listType.match(/duplicates|comments/),
    [post, listType]
  );

  const parentPost = useMemo(() => {
    if (!shouldRenderParent) {
      return null;
    }

    const {
      data: { name },
    } = post;

    return (
      <Post parent duplicate={false} idx={0} post={post} postName={name} />
    );
  }, [post, shouldRenderParent]);

  const commentLinks = useMemo(() => {
    if (!shouldRenderParent || !comment) {
      return null;
    }

    const {
      data: { permalink },
    } = post;

    return renderCommentLinks(
      permalink,
      comment,
      buildDetailNavState(location, inOverlay)
    );
  }, [post, comment, shouldRenderParent, location, inOverlay]);

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
