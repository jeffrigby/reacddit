import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const PostSubLink = ({ subreddit }) => (
  <Link to={{ pathname: `/r/${subreddit}`, state: { showBack: true } }}>
    /r/{subreddit}
  </Link>
);

PostSubLink.propTypes = {
  subreddit: PropTypes.string.isRequired,
};

export default PostSubLink;
