import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { listingData } from '../../../redux/selectors/listingsSelector';
import Post from '../postDetail/Post';
import PostsLoadingStatus from './PostsLoadingStatus';
import PostsFooter from './PostsFooter';

const Posts = ({ data, listType }) => {
  const renderPost = (post, idx) => {
    return <Post postName={post.data.name} key={post.data.id} idx={idx} />;
  };

  const entriesObject = data.children;
  if (!entriesObject) return <PostsLoadingStatus />;
  let entries;
  const entriesKeys = Object.keys(entriesObject);
  if (entriesKeys.length > 0) {
    entries = entriesKeys.map((key, idx) => {
      return renderPost(entriesObject[key], idx);
    });
  }

  const originalPost =
    data.originalPost && listType === 'duplicates'
      ? renderPost(data.originalPost, 0)
      : null;

  return (
    <>
      {originalPost && listType === 'duplicates' && (
        <>
          {originalPost}
          <div className="list-title">Duplicate/Cross Posts</div>
        </>
      )}
      <PostsLoadingStatus />
      {entries}
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

const mapStateToProps = state => ({
  data: listingData(state),
  listType: state.listingsFilter.listType,
});

export default connect(
  mapStateToProps,
  {},
  null
)(Posts);
