import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import RedditAPI from '../../reddit/redditAPI';
import { redditFetchMultis } from '../../redux/actions/reddit';

const MultiDelete = ({ multi, fetchMultis, urlPush }) => {
  const deleteMulti = async () => {
    await RedditAPI.multiDelete(multi.path);
    fetchMultis(true);
    urlPush('/');
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
  fetchMultis: PropTypes.func.isRequired,
  urlPush: PropTypes.func.isRequired,
};

MultiDelete.defaultProps = {};

const mapStateToProps = state => ({});

export default connect(mapStateToProps, {
  fetchMultis: redditFetchMultis,
  urlPush: push,
})(React.memo(MultiDelete));
