import PropTypes from 'prop-types';
import { TwitterTweetEmbed } from 'react-twitter-embed';

const Twitter = ({ tweetId }) => <TwitterTweetEmbed tweetId={tweetId} />;

Twitter.propTypes = {
  tweetId: PropTypes.string.isRequired,
};

export default Twitter;
