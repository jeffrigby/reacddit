import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditSave, redditUnsave } from '../../redux/actions/reddit';
import { PostsContextActionable, PostsContextData } from '../../contexts';
import { hotkeyStatus } from '../../common';

const PostSave = ({ save, unsave, bearer }) => {
  const data = useContext(PostsContextData);
  const actionable = useContext(PostsContextActionable);

  const { saved, name } = data;

  const triggerSave = () => {
    if (bearer.status !== 'auth') return;

    if (saved) {
      unsave(name);
    } else {
      save(name);
    }
  };

  const hotkeys = event => {
    const pressedKey = event.key;

    if (hotkeyStatus()) {
      if (pressedKey === 's') {
        triggerSave();
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

  const saveStr =
    saved === true ? (
      <i className="fas fa-bookmark" />
    ) : (
      <i className="far fa-bookmark" />
    );
  const title = saved === true ? 'Unsave Post (s)' : 'Save Post (s)';

  if (bearer.status !== 'auth') {
    return null;
  }
  return (
    <div id="entry-save">
      <button
        className="btn btn-link btn-sm m-0 p-0"
        onClick={save}
        type="button"
        title={title}
      >
        {saveStr}
      </button>
    </div>
  );
};

PostSave.propTypes = {
  save: PropTypes.func.isRequired,
  unsave: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  bearer: state.redditBearer,
});

export default React.memo(
  connect(
    mapStateToProps,
    {
      save: redditSave,
      unsave: redditUnsave,
    }
  )(PostSave)
);
