import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { useLocation } from 'react-router';
import type { Thing, LinkData, CommentData } from '../../../types/redditApi';
import { selectPostsData } from '../../../redux/slices/listingsSlice';
import { IntersectionObserverProvider } from '../../../contexts';
import { useAppSelector } from '../../../redux/hooks';
import PostsLoadingStatus from './PostsLoadingStatus';
import PostsFooter from './PostsFooter';
import PostsRender from './PostsRender';
import PostsParent from './PostsParent';

interface ListingDataResponse {
  children?: Record<string, Thing<LinkData | CommentData>>;
  originalPost?: Thing<LinkData | CommentData>;
  [key: string]: unknown;
}

function Posts(): ReactElement {
  const location = useLocation();

  // Use memoized combined selector to prevent unnecessary re-renders
  const { listType, data } = useAppSelector((state) =>
    selectPostsData(state, location.key)
  ) as { listType: string; data: ListingDataResponse };

  const { children: entriesObject, originalPost } = data;

  // Memoize regex match and derived state (must be before early return)
  const hasParent = useMemo(
    () => originalPost && listType.match(/duplicates|comments/),
    [originalPost, listType]
  );

  const idxOffset = useMemo(() => (hasParent ? 1 : 0), [hasParent]);

  if (!entriesObject) {
    return <PostsLoadingStatus />;
  }

  return (
    <IntersectionObserverProvider>
      <>
        {hasParent && originalPost && <PostsParent post={originalPost} />}
        <PostsLoadingStatus />
        <PostsRender
          idxOffset={idxOffset}
          listType={listType}
          posts={entriesObject}
        />
        <PostsFooter />
      </>
    </IntersectionObserverProvider>
  );
}

export default memo(Posts);
