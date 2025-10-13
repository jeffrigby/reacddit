import { memo, useContext, useEffect, useState, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import type { LinkData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
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
  const bearer = useAppSelector((state) => state.redditBearer);
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

  const saveIcon = saved === true ? faBookmark : farBookmark;
  const title = saved === true ? 'Unsave Post (s)' : 'Save Post (s)';

  if (bearer.status !== 'auth') {
    return null;
  }
  return (
    <div id="entry-save">
      <Button
        className="shadow-none m-0 p-0"
        size="sm"
        title={title}
        variant="link"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={saveIcon} />
      </Button>
    </div>
  );
}

export default memo(PostSave);
