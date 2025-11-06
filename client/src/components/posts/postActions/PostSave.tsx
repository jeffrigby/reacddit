import {
  memo,
  useContext,
  useEffect,
  useState,
  useCallback,
  useOptimistic,
  startTransition,
} from 'react';
import type { MouseEvent } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark } from '@fortawesome/free-solid-svg-icons';
import { faBookmark as farBookmark } from '@fortawesome/free-regular-svg-icons';
import type { LinkData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { useSavePostMutation, useUnsavePostMutation } from '@/redux/api';
import { PostsContextActionable, PostsContextData } from '@/contexts';
import { hotkeyStatus } from '@/common';

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

  const [savedState, setSavedState] = useState(data.saved);
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(
    savedState,
    (_, newSaved: boolean) => newSaved
  );

  // RTK Query mutation hooks
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();

  const { name } = data;

  const triggerSave = useCallback(async () => {
    if (bearer.status !== 'auth') {
      return;
    }

    const newSavedState = !optimisticSaved;

    // Wrap optimistic update in startTransition (React 19 requirement)
    startTransition(() => {
      setOptimisticSaved(newSavedState);
    });

    try {
      // Use RTK Query mutations instead of direct API calls
      if (newSavedState) {
        await savePost({ id: name }).unwrap();
      } else {
        await unsavePost({ id: name }).unwrap();
      }

      setSavedState(newSavedState);
    } catch (error) {
      console.error('Failed to save/unsave post:', error);
    }
  }, [
    bearer.status,
    name,
    optimisticSaved,
    setOptimisticSaved,
    savePost,
    unsavePost,
  ]);

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

  const saveIcon = optimisticSaved === true ? faBookmark : farBookmark;
  const title = optimisticSaved === true ? 'Unsave Post (s)' : 'Save Post (s)';

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
