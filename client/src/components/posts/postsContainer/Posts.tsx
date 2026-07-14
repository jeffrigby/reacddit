import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import { IntersectionObserverProvider } from '@/contexts';
import {
  useListingsContext,
  useListingsFilter,
} from '@/contexts/ListingsContext';
import PostsLoadingStatus from './PostsLoadingStatus';
import PostsFooter from './PostsFooter';
import PostsRender from './PostsRender';
import PostsParent from './PostsParent';

function Posts(): ReactElement {
  // Get data from RTK Query via context
  const { data } = useListingsContext();

  // Get listType from this tree's own filter (not the global currentFilter)
  const { listType } = useListingsFilter();

  const entriesObject = data?.children;
  const originalPost = data?.originalPost;

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
        <PostsRender idxOffset={idxOffset} posts={entriesObject} />
        <PostsFooter />
      </>
    </IntersectionObserverProvider>
  );
}

export default memo(Posts);
