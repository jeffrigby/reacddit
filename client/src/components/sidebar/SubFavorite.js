import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import produce from 'immer';
import { subredditsData } from '../../redux/actions/subreddits';
import RedditAPI from '../../reddit/redditAPI';

function SubFavorite({ isFavorite, srName }) {
  const me = useSelector((state) => state.redditMe.me);
  const subreddits = useSelector((state) => state.subreddits);
  const dispatch = useDispatch();

  if (!me.name) return null;

  const favButton = isFavorite ? 'fas fa-heart' : 'far fa-heart';

  const toggleFavorite = async () => {
    const favRequest = await RedditAPI.favorite(!isFavorite, srName);
    if (favRequest.status === 200) {
      const newSubs = produce(subreddits, (draftState) => {
        const index = srName.toLowerCase();
        // eslint-disable-next-line no-param-reassign
        draftState.subreddits[index].user_has_favorited = !isFavorite;
      });
      dispatch(subredditsData(newSubs));
    }
  };

  return (
    <button
      className="btn btn-link btn-sm m-0 p-0 me-1 faded"
      type="button"
      title="Toogle Favorites"
      onClick={toggleFavorite}
    >
      <i className={favButton} />
    </button>
  );
}

SubFavorite.propTypes = {
  isFavorite: PropTypes.bool.isRequired,
  srName: PropTypes.string.isRequired,
};

SubFavorite.defaultProps = {};

export default SubFavorite;
