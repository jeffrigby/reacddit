import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { listingData } from '../../../redux/selectors/listingsSelector';
import Post from '../postDetail/Post';
import PostsLoadingStatus from './PostsLoadingStatus';
import PostsFooter from './PostsFooter';

const Posts = ({ data, listType }) => {
  const [renderedPosts, setRenderedPosts] = useState([]);

  useEffect(() => {
    const links = [];
    const renderPost = (post, idx) => {
      let duplicate = false;
      if (!links.includes(post.data.url) && listType !== 'duplicates') {
        links.push(post.data.url);
      } else {
        // This is a dupe
        duplicate = true;
      }
      return (
        <Post
          postName={post.data.name}
          key={post.data.id}
          duplicate={duplicate}
          idx={idx}
        />
      );
    };

    const entriesObject = data.children;
    if (entriesObject) {
      let entries;
      const entriesKeys = Object.keys(entriesObject);
      if (entriesKeys.length > 0) {
        entries = entriesKeys.map((key, idx) => {
          return renderPost(entriesObject[key], idx);
        });
      }
      setRenderedPosts(entries);
    }
  }, [data.children, listType]);

  const entriesObject = data.children;
  if (!entriesObject) return <PostsLoadingStatus />;

  const originalPost =
    data.originalPost && listType === 'duplicates' ? (
      <Post
        postName={data.originalPost.data.name}
        key={data.originalPost.data.id}
        duplicate={false}
        idx={0}
      />
    ) : null;

  return (
    <>
      {originalPost && listType === 'duplicates' && (
        <>
          {originalPost}
          <div className="list-title">Duplicate/Cross Posts</div>
        </>
      )}
      <PostsLoadingStatus />
      {renderedPosts}
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
