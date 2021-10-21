import { useSelector } from 'react-redux';
import { listingData } from '../../../redux/selectors/listingsSelector';
import PostsLoadingStatus from './PostsLoadingStatus';
import PostsFooter from './PostsFooter';
import PostsRender from './PostsRender';
import PostsParent from './PostsParent';

const Posts = () => {
  const listType = useSelector((state) => state.listingsFilter.listType);
  const data = useSelector((state) => listingData(state));

  const entriesObject = data.children;
  if (!entriesObject) return <PostsLoadingStatus />;

  const hasParent = data.originalPost && listType.match(/duplicates|comments/);
  const idxOffset = hasParent ? 1 : 0;

  return (
    <>
      {hasParent && <PostsParent post={data.originalPost} />}
      <PostsLoadingStatus />
      <PostsRender
        posts={entriesObject}
        listType={listType}
        idxOffset={idxOffset}
      />
      <PostsFooter />
    </>
  );
};

export default Posts;
