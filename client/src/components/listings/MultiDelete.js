import { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

const MultiDelete = ({ multi }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const deleteMulti = async () => {
    await RedditAPI.multiDelete(multi.path);
    dispatch(redditFetchMultis(true));
    navigate('/');
  };

  const removeMulti = () => {
    window.confirm(`Permanately delete ${multi.name}?`) && deleteMulti();
  };

  return (
    <button
      aria-label="Delete Custom Feed"
      className="btn btn-sm btn-danger"
      title="Delete Custom Feed"
      type="button"
      onClick={removeMulti}
    >
      <i className="fas fa-trash-alt" />
    </button>
  );
};

MultiDelete.propTypes = {
  multi: PropTypes.object.isRequired,
};

export default memo(MultiDelete);
