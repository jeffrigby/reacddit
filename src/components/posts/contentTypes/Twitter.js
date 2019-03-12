import React from 'react';
import PropTypes from 'prop-types';
import { TwitterTweetEmbed } from 'react-twitter-embed';

const Twitter = ({ content, load }) => {
  // Just load them all. Render looks weird without it.
  return <TwitterTweetEmbed tweetId={content.id} />;

  // if (load) {
  //   return <TwitterTweetEmbed tweetId={content.id} />;
  // } else {
  //   return <div className="placeholder">Loading Tweet...</div>;
  // }
};

Twitter.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default Twitter;
