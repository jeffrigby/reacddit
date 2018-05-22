import { listingsEntryUpdate } from './listings';
import RedditHelpers from '../../reddit/redditHelpers';
import RedditAPI from '../../reddit/redditAPI';

export function redditMultiReddits(multiReddits) {
  return {
    type: 'REDDIT_MUTLI_REDDITS',
    multiReddits,
  };
}

export function redditMe(me) {
  return {
    type: 'REDDIT_ME',
    me,
  };
}

export function redditAuthInfoFetch() {
  return {
    types: ['LOAD', 'REDDIT_AUTH_INFO'],
    payload: {
      request: {
        url: '/json/accessToken',
      },
    },
  };
}

export function redditFetchMe(reset) {
  return async (dispatch, getState) => {
    try {
      const me = await RedditAPI.me(reset);
      const result = {
        me,
        status: 'loaded',
      };
      dispatch(redditMe(result));
    } catch (e) {
      dispatch(redditMe({ status: 'error', error: e.toString() }));
    }
  };
}

export function redditFetchMultis(reset) {
  return async (dispatch, getState) => {
    try {
      const multis = await RedditHelpers.multiMine({}, reset);
      const result = {
        multis: multis.data,
        status: 'loaded',
      };
      dispatch(redditMultiReddits(result));
    } catch (e) {
      dispatch(redditMultiReddits({ status: 'error', error: e.toString() }));
    }
  };
}

export function redditVote(id, dir) {
  return async (dispatch, getState) => {
    const currentState = getState();
    const token = await RedditAPI.getToken();
    if (token) {
      try {
        let { likes, ups } = currentState.listingsEntries.entries[id];
        await RedditAPI.vote(id, dir);

        switch (dir) {
          case 1:
            switch (likes) {
              case true:
                break;
              case false:
                ups += 2;
                break;
              default:
                ups += 1;
                break;
            }
            likes = true;
            break;
          case -1:
            switch (likes) {
              case true:
                ups -= 2;
                break;
              case false:
                break;
              default:
                ups -= 1;
                break;
            }
            likes = false;
            break;
          case 0:
            switch (likes) {
              case true:
                ups -= 1;
                break;
              case false:
                ups += 1;
                break;
              default:
                break;
            }
            likes = null;
            break;
          default:
            break;
        }

        const updatedEntry = {
          name: id,
          ups,
          likes,
        };

        dispatch(listingsEntryUpdate(updatedEntry));
      } catch (e) {
        // console.log(e);
      }
    }
  };
}
