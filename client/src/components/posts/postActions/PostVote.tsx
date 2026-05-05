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
import {
  faArrowAltCircleUp,
  faArrowAltCircleDown,
} from '@fortawesome/free-solid-svg-icons';
import {
  faArrowAltCircleUp as farArrowAltCircleUp,
  faArrowAltCircleDown as farArrowAltCircleDown,
} from '@fortawesome/free-regular-svg-icons';
import type { LinkData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { useVoteMutation } from '@/redux/api';
import { usePostContext, PostsContextActionable } from '@/contexts';
import { hotkeyStatus } from '@/common';

interface VoteState {
  ups: number;
  likes: boolean | null;
}

type VoteDirection = -1 | 0 | 1;

const voteDeltas: Record<string, Record<string, number>> = {
  '1': { true: 0, false: 2, null: 1 },
  '-1': { true: -2, false: 0, null: -1 },
  '0': { true: -1, false: 1, null: 0 },
};

const newLikesState: Record<string, boolean | null> = {
  '1': true,
  '-1': false,
  '0': null,
};

function getNewState(
  dir: VoteDirection,
  ups: number,
  likes: boolean | null
): VoteState {
  const likesKey = String(likes);
  const delta = voteDeltas[String(dir)]?.[likesKey] ?? 0;

  return {
    ups: ups + delta,
    likes: newLikesState[String(dir)] ?? null,
  };
}

function PostVote() {
  const bearer = useAppSelector((state) => state.redditBearer);

  const postContext = usePostContext();
  const { post } = postContext;
  const data = post.data as LinkData;
  const actionable = useContext(PostsContextActionable) as boolean;

  const [voteState, setVoteState] = useState<VoteState>({
    ups: data.ups,
    likes: data.likes ?? null,
  });

  const [optimisticVoteState, setOptimisticVoteState] = useOptimistic(
    voteState,
    (state: VoteState, newDir: VoteDirection) => {
      const effectiveDir: VoteDirection =
        state.likes === (newDir === 1) ? 0 : newDir;
      return getNewState(effectiveDir, state.ups, state.likes);
    }
  );

  // RTK Query mutation hook
  const [voteOnPost] = useVoteMutation();

  const expired = Date.now() / 1000 - data.created_utc;
  const sixmonthSeconds = 182.5 * 86400;
  const disabled = bearer.status !== 'auth' || expired > sixmonthSeconds;

  const upIcon =
    optimisticVoteState.likes === true
      ? faArrowAltCircleUp
      : farArrowAltCircleUp;
  const downIcon =
    optimisticVoteState.likes === false
      ? faArrowAltCircleDown
      : farArrowAltCircleDown;

  const vote = useCallback(
    async (dir: VoteDirection) => {
      if (bearer.status !== 'auth') {
        return;
      }

      const effectiveDir: VoteDirection =
        voteState.likes === (dir === 1) ? 0 : dir;

      // Wrap optimistic update in startTransition (React 19 requirement)
      startTransition(() => {
        setOptimisticVoteState(dir);
      });

      try {
        // Use RTK Query mutation instead of direct API call
        await voteOnPost({ id: data.name, dir: effectiveDir }).unwrap();

        setVoteState(getNewState(effectiveDir, voteState.ups, voteState.likes));
      } catch (error) {
        console.error('Vote failed:', error);
      }
    },
    [bearer.status, data.name, voteState, setOptimisticVoteState, voteOnPost]
  );

  useEffect(() => {
    const hotkeys = (event: KeyboardEvent) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case 'a':
            vote(1);
            break;
          case 'z':
            vote(-1);
            break;
          default:
            break;
        }
      }
    };

    if (actionable) {
      document.addEventListener('keydown', hotkeys);
    } else {
      document.removeEventListener('keydown', hotkeys);
    }
    return () => document.removeEventListener('keydown', hotkeys);
  }, [actionable, vote]);

  const handleUpvote = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    vote(1);
  };

  const handleDownvote = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    vote(-1);
  };

  return (
    <div className="vote">
      <Button
        aria-pressed={optimisticVoteState.likes === true}
        className="shadow-none"
        disabled={disabled}
        size="sm"
        title="Vote Up (a)"
        variant="link"
        onClick={handleUpvote}
      >
        {' '}
        <FontAwesomeIcon icon={upIcon} />{' '}
      </Button>
      <span>{optimisticVoteState.ups.toLocaleString()}</span>
      <Button
        aria-label="Vote Down"
        aria-pressed={optimisticVoteState.likes === false}
        className="shadow-none"
        disabled={disabled}
        size="sm"
        title="Vote Down (z)"
        variant="link"
        onClick={handleDownvote}
      >
        <FontAwesomeIcon icon={downIcon} />
      </Button>
    </div>
  );
}

export default memo(PostVote);
