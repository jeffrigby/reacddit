import { memo, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { MouseEvent } from 'react';
import type { RootState } from '@/types/redux';
import type { LinkData } from '@/types/redditApi';
import { PostsContextActionable, PostsContextData } from '@/contexts';
import { hotkeyStatus } from '@/common';
import { save as saveAPI, unsave as unsaveAPI } from '@/reddit/redditApiTs';

interface PostContextData {
  post: {
    kind: string;
    data: LinkData;
  };
}

function PostSave() {
  const bearer = useSelector((state: RootState) => state.redditBearer);
  const postContext = useContext(PostsContextData) as PostContextData;
  const { post } = postContext;
  const { data } = post;
  const actionable = useContext(PostsContextActionable) as boolean;

  const [saved, setSaved] = useState(data.saved);

  const { name } = data;

  const triggerSave = useCallback(async () => {
    if (bearer.status !== 'auth') {
      return;
    }

    try {
      if (saved) {
        await unsaveAPI(name);
        setSaved(false);
        // @todo Update redux
      } else {
        await saveAPI(name);
        setSaved(true);
        // @todo Update redux
      }
    } catch (error) {
      console.error('Failed to save/unsave post:', error);
    }
  }, [bearer.status, name, saved]);

  useEffect(() => {
    const hotkeys = (event: KeyboardEvent) => {
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

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    triggerSave();
  };

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
        onClick={handleClick}
      >
        {saveStr}
      </button>
    </div>
  );
}

export default memo(PostSave);
