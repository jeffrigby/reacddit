import pLimit from 'p-limit';
import type { AppDispatch, RootState, SubredditsState } from '@/types/redux';
import type { SubredditData, Thing } from '@/types/redditApi';
import RedditAPI from '@/reddit/redditAPI';
import { getLastUpdatedWithDelay, shouldUpdate } from './helpers/lastFetched';

interface SubredditsStatusAction {
  type: 'SUBREDDITS_STATUS';
  status: 'unloaded' | 'loading' | 'loaded' | 'error';
  message?: string;
}

interface SubredditsFilterAction {
  type: 'SUBREDDITS_FILTER';
  filter: Partial<{
    filterText: string;
    active: boolean;
    activeIndex: number;
  }>;
}

interface SubredditsDataAction {
  type: 'SUBREDDITS_DATA';
  subreddits: SubredditsState;
}

interface SubredditsLastUpdatedAction {
  type: 'SUBREDDITS_LAST_UPDATED';
  lastUpdated: Record<string, { lastPost: number; expires: number }>;
}

interface SubredditsClearLastUpdatedAction {
  type: 'SUBREDDITS_LAST_UPDATED_CLEAR';
  clear: boolean;
}

export type SubredditsAction =
  | SubredditsStatusAction
  | SubredditsFilterAction
  | SubredditsDataAction
  | SubredditsLastUpdatedAction
  | SubredditsClearLastUpdatedAction;

export function subredditsStatus(
  status: 'unloaded' | 'loading' | 'loaded' | 'error',
  message?: string
): SubredditsStatusAction {
  return {
    type: 'SUBREDDITS_STATUS',
    status,
    message,
  };
}

export function subredditsFilter(
  filter: Partial<{
    filterText: string;
    active: boolean;
    activeIndex: number;
  }>
): SubredditsFilterAction {
  return {
    type: 'SUBREDDITS_FILTER',
    filter,
  };
}

export function subredditsData(
  subreddits: SubredditsState
): SubredditsDataAction {
  return {
    type: 'SUBREDDITS_DATA',
    subreddits,
  };
}

export function subredditsLastUpdated(
  lastUpdated: Record<string, { lastPost: number; expires: number }>
): SubredditsLastUpdatedAction {
  return {
    type: 'SUBREDDITS_LAST_UPDATED',
    lastUpdated,
  };
}

export function subredditsClearLastUpdated(): SubredditsClearLastUpdatedAction {
  const clear = true;
  return {
    type: 'SUBREDDITS_LAST_UPDATED_CLEAR',
    clear,
  };
}

let subredditsFetchLastUpdatedRunning = false;
/**
 * Fetch the last post for each subreddit and recheck based on when
 * it was last updated.
 */
export function subredditsFetchLastUpdated() {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      if (subredditsFetchLastUpdatedRunning) {
        return;
      }
      subredditsFetchLastUpdatedRunning = true;
      const currentState = getState();
      const { subreddits } = currentState.subreddits;
      const { lastUpdated } = currentState;

      // Create subreddit requests
      const lookups: Array<{
        type: 'friend' | 'subreddit';
        path: string;
        id: string;
      }> = [];

      Object.entries(subreddits).forEach(([key, subreddit]) => {
        if (shouldUpdate(lastUpdated, subreddit.name)) {
          // Check if it's a subreddit or a user
          if (subreddit.url.match(/^\/user\//)) {
            lookups.push({
              type: 'friend',
              path: subreddit.url.replace(/^\/user\/|\/$/g, ''),
              id: subreddit.name,
            });
            return;
          }

          lookups.push({
            type: 'subreddit',
            path: subreddit.url.replace(/^\/r\/|\/$/g, ''),
            id: subreddit.name,
          });
        }
      });

      const fetchWithDelay = async (lookup: (typeof lookups)[0]) => {
        const { type, path, id } = lookup;
        const toUpdate = await getLastUpdatedWithDelay(type, path, id, 2, 5);
        if (toUpdate !== null) {
          dispatch(subredditsLastUpdated(toUpdate));
        }
      };

      const limit = pLimit(5);
      const max = 100;
      // Limit to max amount
      const maxLookups = lookups.slice(0, max);
      const fetchPromises = maxLookups.map((lookup) =>
        limit(() => fetchWithDelay(lookup))
      );

      await Promise.all(fetchPromises);
    } catch (e) {
      console.error('Error fetching last updated', e);
    } finally {
      subredditsFetchLastUpdatedRunning = false;
    }
  };
}

/**
 * Map the post children ids to the keys.
 */
const mapSubreddits = (
  children: Thing<SubredditData>[]
): Record<string, SubredditData> =>
  Object.entries(children)
    .map(([key, value]: [string, Thing<SubredditData>]) => value.data)
    .reduce((ac, s) => ({ ...ac, [s.display_name.toLowerCase()]: s }), {});

/**
 * Fetch all the subreddits and concat them together
 * This is because of the 100 sub limit.
 */
const subredditsAll = async (
  where: string,
  options?: Record<string, unknown>
): Promise<Record<string, SubredditData>> => {
  let init = true;
  let qsAfter = null;
  let srs = null;
  let subreddits = {};

  // console.log('uncached');

  const newOptions = options ?? {};

  while (init || qsAfter) {
    init = false;
    newOptions.after = qsAfter;
    srs = await RedditAPI.subreddits(where, newOptions);
    const mapped = mapSubreddits(srs.data.children);
    subreddits = { ...mapped, ...subreddits };
    qsAfter = srs.data.after ?? null;
  }

  return subreddits;
};

/**
 * Fetch the subreddits from the cache first or from reddit directly
 * @param reset - ignore the cache
 * @param where - what kind of subreddits to fetch This is useless
 *  right now. Keyed to subscriber.
 *    subscriber - subreddits the user is subscribed to
 *    contributor - subreddits the user is an approved submitter in
 *    moderator - subreddits the user is a moderator of
 *    streams - subscribed to subreddits that contain hosted video links
 */
export function subredditsFetchData(
  reset?: boolean,
  where: string = 'subscriber'
) {
  return async (dispatch: AppDispatch, getState: () => RootState) => {
    try {
      const currentState = getState();

      // Look for the cache.
      if (
        currentState.subreddits !== undefined &&
        !reset &&
        currentState.subreddits.status === 'loaded'
      ) {
        // Cache for one day
        const subExpired =
          Date.now() >
          (currentState.subreddits.lastUpdated ?? 0) + 3600 * 24 * 1000;
        if (currentState.subreddits.status === 'loaded' && !subExpired) {
          dispatch(subredditsFetchLastUpdated());
          return;
        }
      }

      // Not cached.
      dispatch(subredditsStatus('loading'));
      const subreddits = await subredditsAll(where, {});
      const lastUpdated = Date.now();
      const storeSubs: SubredditsState = {
        status: 'loaded',
        subreddits,
        lastUpdated,
      };
      await dispatch(subredditsData(storeSubs));
      dispatch(subredditsFetchLastUpdated());
    } catch (e) {
      dispatch(
        subredditsStatus(
          'error',
          e instanceof Error ? e.toString() : 'Unknown error'
        )
      );
    }
  };
}
