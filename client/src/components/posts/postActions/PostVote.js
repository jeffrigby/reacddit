import { memo, useContext, useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { PostsContextData, PostsContextActionable } from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import redditAPI from '../../../reddit/redditAPI';

const getNewState = (dir, ups, likes) => {
  const newState = {
    ups,
    likes,
  };
  switch (dir) {
    case 1:
      switch (likes) {
        case true:
          break;
        case false:
          newState.ups += 2;
          break;
        default:
          newState.ups += 1;
          break;
      }
      newState.likes = true;
      break;
    case -1:
      switch (likes) {
        case true:
          newState.ups -= 2;
          break;
        case false:
          break;
        default:
          newState.ups -= 1;
          break;
      }
      newState.likes = false;
      break;
    case 0:
      switch (likes) {
        case true:
          newState.ups -= 1;
          break;
        case false:
          newState.ups += 1;
          break;
        default:
          break;
      }
      newState.likes = null;
      break;
    default:
      break;
  }

  return newState;
};

const PostVote = () => {
  const bearer = useSelector((state) => state.redditBearer);

  const postContext = useContext(PostsContextData);
  const { data } = postContext.post;
  const actionable = useContext(PostsContextActionable);

  const [ups, setUps] = useState(data.ups);
  const [likes, setLikes] = useState(data.likes);

  const expired = Date.now() / 1000 - data.created_utc;
  const sixmonthSeconds = 182.5 * 86400; // I don't know when reddit exactly cuts it off.
  const disabled = bearer.status !== 'auth' || expired > sixmonthSeconds;

  const upClass = likes === true ? 'fas' : 'far';
  const downClass = likes === false ? 'fas' : 'far';

  const vote = useCallback(
    (dir) => {
      if (bearer.status !== 'auth') return;

      // Check if this has already been voted on
      const newDir = likes === (dir === 1) ? 0 : dir;

      const newState = getNewState(newDir, ups, likes);
      setLikes(newState.likes);
      setUps(newState.ups);
      redditAPI.vote(data.name, dir);
    },
    [bearer.status, data.name, likes, ups]
  );

  useEffect(() => {
    const hotkeys = (event) => {
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

  return (
    <div className="vote">
      <button
        type="button"
        className="btn btn-link btn-sm shadow-none"
        disabled={disabled}
        onClick={() => vote(1)}
        title="Vote Up (a)"
      >
        {' '}
        <i className={`fa-arrow-alt-circle-up ${upClass}`} />{' '}
      </button>
      <span>{ups.toLocaleString()}</span>
      <button
        type="button"
        className="btn btn-link btn-sm shadow-none"
        disabled={disabled}
        onClick={() => vote(-1)}
        title="Vote Down (z)"
      >
        <i className={`fa-arrow-alt-circle-down ${downClass}`} />
      </button>
    </div>
  );
};

export default memo(PostVote);
