import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditVote } from '../../redux/actions/reddit';

const PostVote = props => {
  const { bearer, likes, vote, id, ups } = props;
  const disabled = bearer.status !== 'auth';
  const upClass = likes === true ? 'fas' : 'far';
  const upDir = likes === true ? 0 : 1;
  const downClass = likes === false ? 'fas' : 'far';
  const downDir = likes === false ? 0 : -1;
  return (
    <div className="vote">
      <button
        type="button"
        className="btn btn-link btn-sm"
        disabled={disabled}
        onClick={() => vote(`t3_${id}`, upDir)}
      >
        <i className={`fa-arrow-alt-circle-up ${upClass}`} />
      </button>
      <span className="small">{ups.toLocaleString()}</span>
      <button
        type="button"
        className="btn btn-link btn-sm"
        disabled={disabled}
        onClick={() => vote(`t3_${id}`, downDir)}
      >
        <i className={`fa-arrow-alt-circle-down ${downClass}`} />
      </button>
    </div>
  );
};

PostVote.propTypes = {
  id: PropTypes.string.isRequired,
  ups: PropTypes.number.isRequired,
  likes: PropTypes.bool,
  vote: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

PostVote.defaultProps = {
  likes: null,
};

const mapStateToProps = state => ({
  bearer: state.redditBearer,
});

const mapDispatchToProps = dispatch => ({
  vote: (id, dir) => dispatch(redditVote(id, dir)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostVote);
