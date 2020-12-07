import React from 'react';
import PropTypes from 'prop-types';
import { TwitterTweetEmbed } from 'react-twitter-embed';

const Twitter = ({ content, load }) => (
  <TwitterTweetEmbed tweetId={content.id} />
);

Twitter.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default Twitter;
