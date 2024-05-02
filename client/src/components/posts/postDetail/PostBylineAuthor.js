import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { redditFetchFriends } from '../../../redux/actions/reddit';
import RedditAPI from '../../../reddit/redditAPI';

const classNames = require('classnames');

/**
 * Renders the author information and actions for a post.
 *
 * @param {string} author - The username of the post author.
 * @param {string|null} flair - The flair for the post author. Defaults to null.
 * @param {boolean} isSubmitter - Specifies if the author is also the submitter of the post. Defaults to false.
 *
 * @returns {JSX.Element} - The rendered author information and actions.
 */
function PostBylineAuthor({ author, flair = null, isSubmitter = false }) {
  const redditFriends = useSelector((state) => state.redditFriends);
  const dispatch = useDispatch();

  const removeFriend = async (name) => {
    await RedditAPI.removeFriend(name);
    dispatch(redditFetchFriends(true));
  };

  const addFriend = async (name) => {
    await RedditAPI.addFriend(name);
    dispatch(redditFetchFriends(true));
  };

  const { friends } = redditFriends;
  const friendList = Object.keys(friends);
  const isFriend = friendList.includes(author.toLowerCase());

  const onClick = () => (isFriend ? removeFriend(author) : addFriend(author));
  const title = !isFriend
    ? `add ${author} to your friends.`
    : `remove ${author} from your friends.`;

  const authorFlair = flair ? (
    <span className="badge bg-dark">{flair}</span>
  ) : null;

  const authorClasses = classNames({
    'is-friend': isFriend,
    'is-submitter': isSubmitter,
  });

  return author === '[deleted]' ? (
    <div>
      <i className="fas fa-user" /> {author}
    </div>
  ) : (
    <>
      <button
        className="btn btn-link btn-sm shadow-none"
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
      >
        <i className={`fas ${isFriend ? 'fa-user-minus' : 'fa-user-plus'}`} />
      </button>{' '}
      <Link
        to={{
          pathname: `/user/${author}/posts/new`,
          state: { showBack: true },
        }}
        className={authorClasses}
      >
        {author}
      </Link>{' '}
      {authorFlair}
    </>
  );
}

PostBylineAuthor.propTypes = {
  author: PropTypes.string.isRequired,
  flair: PropTypes.string,
  isSubmitter: PropTypes.bool,
};

export default PostBylineAuthor;
