import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';
import type { Thing, LinkData, CommentData } from '../../../types/redditApi';
import { IntersectionObserverProvider } from '../../../contexts';
import { useListingsContext } from '../../../contexts/ListingsContext';
import { useAppSelector } from '../../../redux/hooks';
import { selectFilter } from '../../../redux/slices/listingsSlice';
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
  // Get data from RTK Query via context
  const { data } = useListingsContext();

  // Get listType from current filter
  const filter = useAppSelector(selectFilter);
  const listType = filter.listType;

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
