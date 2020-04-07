import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { redditFetchFriends } from '../../../redux/actions/reddit';
import RedditAPI from '../../../reddit/redditAPI';

const PostBylineAuthor = ({ author, flair, redditFriends, getFriends }) => {
  const removeFriend = async (name) => {
    await RedditAPI.removeFriend(name);
    getFriends(true);
  };

  const addFriend = async (name) => {
    await RedditAPI.addFriend(name);
    getFriends(true);
  };

  const { friends } = redditFriends;
  const friendList = Object.keys(friends);
  const isFriend = friendList.includes(author.toLowerCase());

  const onClick = () => (isFriend ? removeFriend(author) : addFriend(author));
  const title = !isFriend
    ? `add ${author} to your friends.`
    : `remove ${author} from your friends.`;

  const authorFlair = flair ? (
    <>
      <span className="badge badge-dark">{flair}</span>
    </>
  ) : null;

  const authorLink =
    author === '[deleted]' ? (
      <div>
        <i className="fas fa-user" /> {author}
      </div>
    ) : (
      <>
        <>
          <button
            className="btn btn-link btn-sm"
            type="button"
            onClick={onClick}
            title={title}
          >
            <i
              className={`fas ${isFriend ? 'fa-user-minus' : 'fa-user-plus'}`}
            />
          </button>{' '}
          <Link
            to={`/user/${author}/submitted/new`}
            className={isFriend ? 'is-friend' : 'not-friend'}
          >
            {author}
          </Link>{' '}
          {authorFlair}
        </>
      </>
    );

  return <>{authorLink}</>;
};

PostBylineAuthor.propTypes = {
  redditFriends: PropTypes.object.isRequired,
  getFriends: PropTypes.func.isRequired,
  author: PropTypes.string.isRequired,
  flair: PropTypes.string,
};

PostBylineAuthor.defaultProps = {
  flair: null,
};

const mapStateToProps = (state) => ({
  redditFriends: state.redditFriends,
});

export default connect(mapStateToProps, {
  getFriends: redditFetchFriends,
})(PostBylineAuthor);
