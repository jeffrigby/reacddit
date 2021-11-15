import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { redditFetchFriends } from '../../../redux/actions/reddit';
import RedditAPI from '../../../reddit/redditAPI';

const classNames = require('classnames');

function PostBylineAuthor({ author, flair, isSubmitter }) {
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

  const authorLink =
    author === '[deleted]' ? (
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

  return authorLink;
}

PostBylineAuthor.propTypes = {
  author: PropTypes.string.isRequired,
  flair: PropTypes.string,
  isSubmitter: PropTypes.bool,
};

PostBylineAuthor.defaultProps = {
  flair: null,
  isSubmitter: false,
};

export default PostBylineAuthor;
