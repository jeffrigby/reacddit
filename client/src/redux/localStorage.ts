/**
 * Redux state persistence utilities for localStorage
 * Following Redux best practices for state serialization
 */
import cookies from 'js-cookie';
import type { RootState } from './configureStore';

/**
 * Type for the persisted state (subset of RootState)
 * Only persist slices that should be cached across sessions
 */
export type PersistedState = Partial<
  Pick<
    RootState,
    | 'siteSettings'
    | 'subreddits'
    | 'redditMultiReddits'
    | 'redditMe'
    | 'history'
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

    const persistedState = JSON.parse(serializedState) as PersistedState;
    const cookieToken = cookies.get('token');

    // Check if we have a valid cookie token
    const hasCookieToken = cookieToken !== undefined;

    // If no cookie token, clear auth-specific data from persisted state
    // This prevents showing authenticated user's subreddits/multis/me when logged out
    if (!hasCookieToken) {
      // Clear auth-specific slices but preserve siteSettings and history
      return {
        siteSettings: persistedState.siteSettings,
        history: persistedState.history,
        // Don't restore subreddits, redditMultiReddits, or redditMe when not authenticated
      };
    }

    // Reset runtime flags that should never be persisted
    return {
      ...persistedState,
      subreddits: persistedState.subreddits
        ? {
            ...persistedState.subreddits,
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
 * Save state to localStorage
 * @param state - Partial state to persist (should only include serializable data)
 */
export function saveState(state: PersistedState): void {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}
