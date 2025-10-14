/**
 * Redux state persistence utilities for localStorage
 * Following Redux best practices for state serialization
 */
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
 * @returns Partial state to merge with initial state, or undefined if none exists
 */
export function loadState(): PersistedState | undefined {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState) as PersistedState;
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
