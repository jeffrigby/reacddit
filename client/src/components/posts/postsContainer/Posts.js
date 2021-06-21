import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { listingData } from '../../../redux/selectors/listingsSelector';
import PostsLoadingStatus from './PostsLoadingStatus';
import PostsFooter from './PostsFooter';
import PostsRender from './PostsRender';
import PostsParent from './PostsParent';

const Posts = ({ data, listType }) => {
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

Posts.propTypes = {
  data: PropTypes.object.isRequired,
  listType: PropTypes.string,
};

Posts.defaultProps = {
  listType: '',
};

const mapStateToProps = (state) => ({
  data: listingData(state),
  listType: state.listingsFilter.listType,
});

export default connect(mapStateToProps, {}, null)(Posts);
