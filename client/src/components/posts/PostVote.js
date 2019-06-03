import React from 'react';
import PropTypes from 'prop-types';

const PostVote = ({ bearer, likes, ups, voteUp, voteDown }) => {
  const disabled = bearer.status !== 'auth';
  const upClass = likes === true ? 'fas' : 'far';
  const downClass = likes === false ? 'fas' : 'far';
  return (
    <div className="vote">
      <button
        type="button"
        className="btn btn-link btn-sm"
        disabled={disabled}
        onClick={voteUp}
        title="Vote Up (a)"
      >
        <i className={`fa-arrow-alt-circle-up ${upClass}`} />
      </button>
      <span className="small">{ups.toLocaleString()}</span>
      <button
        type="button"
        className="btn btn-link btn-sm"
        disabled={disabled}
        onClick={voteDown}
        title="Vote Down (z)"
      >
        <i className={`fa-arrow-alt-circle-down ${downClass}`} />
      </button>
    </div>
  );
};

PostVote.propTypes = {
  ups: PropTypes.number.isRequired,
  likes: PropTypes.bool,
  voteUp: PropTypes.func.isRequired,
  voteDown: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

PostVote.defaultProps = {
  likes: null,
};

export default React.memo(PostVote);
