import { createSelector } from '@reduxjs/toolkit';

const postFocusedSelector = (state, postName, idx, locationKey) => {
  const key = locationKey || 'front';
  const listingState = state.listings?.uiStateByLocation[key];
  if (!listingState) {
    return idx === 0;
  }
  const { focused } = listingState;
  return !focused ? idx === 0 : focused === postName;
};

const postActionableSelector = (state, postName, idx, locationKey) => {
  const key = locationKey || 'front';
  const listingState = state.listings?.uiStateByLocation[key];
  if (!listingState) {
    return idx === 0;
  }
  const { actionable } = listingState;
  return !actionable ? idx === 0 : actionable === postName;
};

export const postFocused = createSelector(
  [postFocusedSelector],
  (focused) => focused
);

export const postActionable = createSelector(
  [postActionableSelector],
  (actionable) => actionable
);
