import React, { useContext, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { PostsContextActionable, PostsContextData } from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import redditAPI from '../../../reddit/redditAPI';

const PostSave = ({ bearer }) => {
  const post = useContext(PostsContextData);
  const { data } = post;
  const actionable = useContext(PostsContextActionable);

  const [saved, setSaved] = useState(data.saved);

  const { name } = data;

  const triggerSave = useCallback(() => {
    if (bearer.status !== 'auth') return;

    if (saved) {
      redditAPI.unsave(name);
      setSaved(false);
      // @todo Update redux
    } else {
      redditAPI.save(name);
      setSaved(true);
      // @todo Update redux
    }
  }, [bearer.status, name, saved]);

  useEffect(() => {
    const hotkeys = event => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        if (pressedKey === 's') {
          triggerSave();
        }
      }
    };

    if (actionable) {
      document.addEventListener('keydown', hotkeys);
    } else {
      document.removeEventListener('keydown', hotkeys);
    }
    return () => {
      return document.removeEventListener('keydown', hotkeys);
    };
  }, [actionable, triggerSave]);

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
        onClick={triggerSave}
        type="button"
        title={title}
      >
        {saveStr}
      </button>
    </div>
  );
};

PostSave.propTypes = {
  bearer: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  bearer: state.redditBearer,
});

export default React.memo(connect(mapStateToProps, {})(PostSave));
