import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PostsContextData, PostsContextActionable } from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import { redditVote } from '../../../redux/actions/reddit';

const PostVote = ({ bearer, vote }) => {
  const data = useContext(PostsContextData);
  const actionable = useContext(PostsContextActionable);
  const expired = Date.now() / 1000 - data.created_utc;
  const sixmonthSeconds = 182.5 * 86400; // I don't know when reddit exactly cuts it off.
  const disabled = bearer.status !== 'auth' || expired > sixmonthSeconds;

  const { ups, likes } = data;

  const upClass = likes === true ? 'fas' : 'far';
  const downClass = likes === false ? 'fas' : 'far';

  const voteUp = () => {
    if (bearer.status !== 'auth') return;

    const dir = likes === true ? 0 : 1;
    vote(data.name, dir);
  };

  const voteDown = () => {
    if (bearer.status !== 'auth') return;

    const dir = likes === false ? 0 : -1;
    vote(data.name, dir);
  };

  const hotkeys = event => {
    const pressedKey = event.key;

    if (hotkeyStatus()) {
      switch (pressedKey) {
        case 'a':
          voteUp();
          break;
        case 'z':
          voteDown();
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    if (actionable) {
      document.addEventListener('keydown', hotkeys);
    } else {
      document.removeEventListener('keydown', hotkeys);
    }
    return () => {
      return document.removeEventListener('keydown', hotkeys);
    };
  });

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
  vote: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  bearer: state.redditBearer,
});

export default React.memo(
  connect(mapStateToProps, {
    vote: redditVote,
  })(PostVote)
);
