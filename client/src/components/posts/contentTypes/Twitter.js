import PropTypes from 'prop-types';
import { TwitterTweetEmbed } from 'react-twitter-embed';

function Twitter({ tweetId }) {
  return <TwitterTweetEmbed tweetId={tweetId} />;
}

Twitter.propTypes = {
  tweetId: PropTypes.string.isRequired,
};

export default Twitter;
