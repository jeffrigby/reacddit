/**
 * Type definitions for router navigation state (history.state.usr)
 */

/**
 * A serializable snapshot of a router location, stored in navigation state so
 * the listing the user navigated from can keep rendering behind the
 * post-detail overlay. `key` is essential: the background tree renders
 * against this location and must keep a stable location.key so nothing
 * remounts or transitions.
 */
export interface BackgroundLocation {
  pathname: string;
  search: string;
  hash: string;
  key: string;
  state?: unknown;
}

/**
 * The navigation state shape used by internal links.
 */
export interface NavState {
  showBack?: boolean;
  backgroundLocation?: BackgroundLocation;
}
