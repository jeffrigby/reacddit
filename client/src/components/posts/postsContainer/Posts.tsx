import type { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import type { RootState } from '../../../types/redux';
import type { Thing, LinkData, CommentData } from '../../../types/redditApi';
import { listingData } from '../../../redux/selectors/listingsSelector';
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
  const listType = useSelector(
    (state: RootState) => state.listingsFilter.listType
  );
  const data = useSelector((state: RootState) =>
    listingData(state, location.key)
  ) as ListingDataResponse;

  const { children: entriesObject, originalPost } = data;

  if (!entriesObject) {
    return <PostsLoadingStatus />;
  }

  const hasParent = originalPost && listType.match(/duplicates|comments/);
  const idxOffset = hasParent ? 1 : 0;

  return (
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
  );
}

export default Posts;
