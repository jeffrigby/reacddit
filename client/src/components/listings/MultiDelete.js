import { memo } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { push } from 'connected-react-router';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

const MultiDelete = ({ multi }) => {
  const dispatch = useDispatch();

  const deleteMulti = async () => {
    await RedditAPI.multiDelete(multi.path);
    dispatch(redditFetchMultis(true));
    dispatch(push('/'));
  };

  const removeMulti = () => {
    // eslint-disable-next-line no-alert
    window.confirm(`Permanately delete ${multi.name}?`) && deleteMulti();
  };

  return (
    <>
      <button
        className="btn btn-sm btn-danger"
        type="button"
        title="Delete Custom Feed"
        onClick={removeMulti}
      >
        <i className="fas fa-trash-alt" />
      </button>
    </>
  );
};

MultiDelete.propTypes = {
  multi: PropTypes.object.isRequired,
};

MultiDelete.defaultProps = {};

export default memo(MultiDelete);
