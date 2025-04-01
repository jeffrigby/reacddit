import { memo, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PostsContextActionable, PostsContextData } from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import redditAPI from '../../../reddit/redditAPI';

const PostSave = () => {
  const bearer = useSelector((state) => state.redditBearer);
  const postContext = useContext(PostsContextData);
  const { post } = postContext;
  const { data } = post;
  const actionable = useContext(PostsContextActionable);

  const [saved, setSaved] = useState(data.saved);

  const { name } = data;

  const triggerSave = useCallback(() => {
    if (bearer.status !== 'auth') {
      return;
    }

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
    const hotkeys = (event) => {
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
    return () => document.removeEventListener('keydown', hotkeys);
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
        className="btn btn-link shadow-none btn-sm m-0 p-0"
        title={title}
        type="button"
        onClick={triggerSave}
      >
        {saveStr}
      </button>
    </div>
  );
};

export default memo(PostSave);
