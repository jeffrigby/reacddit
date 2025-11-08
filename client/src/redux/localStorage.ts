/**
 * Redux state persistence utilities for localStorage
 * Following Redux best practices for state serialization
 */
import cookies from 'js-cookie';
import type { RootState } from './configureStore';

/**
 * Endpoint names that should be persisted to localStorage
 * These are long-lived, user-specific data that rarely changes
 */
const PERSISTABLE_ENDPOINTS = [
  'getMe', // User profile (24h cache)
  'getMultiReddits', // Custom feeds (24h cache)
  'getSubreddits', // Subreddit list (1h cache)
  'getMultiRedditInfo', // Multi details (24h cache)
  'getSubredditAbout', // Subreddit metadata (24h cache)
];

/**
 * RTK Query API state structure (simplified for persistence filtering)
 */
interface ApiState {
  queries?: Record<string, unknown>;
  mutations?: Record<string, unknown>;
  subscriptions?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Filter RTK Query cache to only persist specific endpoints
 * Excludes volatile data (listings, search, comments) that should be fresh on reload
 */
function filterApiCache(apiState: ApiState): ApiState {
  if (!apiState?.queries) {
    return apiState;
  }

  const filteredQueries: Record<string, unknown> = {};

  for (const [cacheKey, cacheEntry] of Object.entries(apiState.queries)) {
    // Cache keys are in format: "endpointName(arg)"
    // Extract endpoint name before the opening parenthesis
    const endpointName = cacheKey.split('(')[0];

    if (PERSISTABLE_ENDPOINTS.includes(endpointName)) {
      filteredQueries[cacheKey] = cacheEntry;
    }
  }

  return {
    ...apiState,
    queries: filteredQueries,
    // Never persist mutations or subscriptions - these are runtime-only
    mutations: {},
    subscriptions: {},
  };
}

/**
 * Type for the persisted state (subset of RootState)
 * Only persist slices that should be cached across sessions
 */
export type PersistedState = Partial<
  Pick<
    RootState,
    'siteSettings' | 'subredditPolling' | 'redditMe' | 'history' | 'redditApi'
  >
>;

/**
 * Load persisted state from localStorage
 * Validates that auth-specific data matches current authentication status
 * @returns Partial state to merge with initial state, or undefined if none exists
 */
export function loadState(): PersistedState | undefined {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }

    const rawState = JSON.parse(serializedState);
    const persistedState = rawState as PersistedState;
    const cookieToken = cookies.get('token');

    // Check if we have a valid cookie token
    const hasCookieToken = cookieToken !== undefined;

    // If no cookie token, clear auth-specific data from persisted state
    // This prevents showing authenticated user's data when logged out
    if (!hasCookieToken) {
      // Clear auth-specific slices but preserve siteSettings and history
      return {
        siteSettings: persistedState.siteSettings,
        history: persistedState.history,
        // Don't restore subredditPolling, redditMe, or redditApi when not authenticated
      };
    }

    // Reset runtime flags that should never be persisted
    return {
      ...persistedState,
      subredditPolling: persistedState.subredditPolling
        ? {
            ...persistedState.subredditPolling,
            lastUpdatedRunning: false, // Reset polling lock
            lastUpdatedError: null, // Clear stale errors
          }
        : undefined,
    };
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
}

/**
 * Save state to localStorage with selective RTK Query cache persistence
 * @param state - Partial state to persist (should only include serializable data)
 */
export function saveState(state: PersistedState): void {
  try {
    // Filter RTK Query cache to only persist long-lived endpoints
    const filteredState = {
      ...state,
      redditApi: state.redditApi ? filterApiCache(state.redditApi) : undefined,
    };

    const serializedState = JSON.stringify(filteredState);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}
