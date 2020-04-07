import { createSelector } from 'reselect';

const postSelector = (state, props) => {
  const { postName } = props;
  const key = state.router.location.key || 'front';
  const entries = state.listingsRedditEntries[key];
  const { listType } = state.listingsFilter;
  if (
    listType.match(/duplicates|comments/) &&
    entries.originalPost.data.name === postName
  ) {
    return entries.originalPost;
  }
  const post = entries.children[postName];
  return post || {};
};

const postVisibilitySelector = (state, props) => {
  const { postName, idx } = props;
  const key = state.router.location.key || 'front';
  const listingState = state.listingsState[key];
  if (!listingState) {
    return idx < 5;
  }
  const { visible } = listingState;
  return visible.length === 0 ? idx < 5 : visible.includes(postName);
};

const postFocusedSelector = (state, props) => {
  const { postName, idx } = props;
  const key = state.router.location.key || 'front';
  const listingState = state.listingsState[key];
  if (!listingState) {
    return idx === 0;
  }
  const { focused } = listingState;
  return !focused ? idx === 0 : focused === postName;
};

const postActionableSelector = (state, props) => {
  const { postName, idx } = props;
  const key = state.router.location.key || 'front';
  const listingState = state.listingsState[key];
  if (!listingState) {
    return idx === 0;
  }
  const { actionable } = listingState;
  return !actionable ? idx === 0 : actionable === postName;
};

const postMinHeightSelector = (state, props) => {
  const { postName } = props;
  const key = state.router.location.key || 'front';
  const listingState = state.listingsState[key];
  if (!listingState) {
    return 0;
  }

  const { minHeights } = listingState;
  return minHeights[postName] ? minHeights[postName] : 0;
};

export const postData = createSelector([postSelector], (post) => post);

export const postVisibility = createSelector(
  [postVisibilitySelector],
  (visible) => visible
);

export const postFocused = createSelector(
  [postFocusedSelector],
  (focused) => focused
);

export const postActionable = createSelector(
  [postActionableSelector],
  (actionable) => actionable
);

export const postMinHeight = createSelector(
  [postVisibilitySelector, postMinHeightSelector],
  (visible, minHeight) => {
    return !visible ? minHeight : 0;
  }
);
