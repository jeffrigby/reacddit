/**
 * Modern Redux Toolkit slice for navigation history tracking
 * Following Redux Toolkit 2.0+ best practices
 */
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * State shape for history slice
 */
export interface HistoryState {
  paths: string[];
}

/**
 * Initial state
 */
const initialState: HistoryState = {
  paths: [],
};

/**
 * History slice
 */
const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    /**
     * Add a new path to the history
     * Uses Immer for immutable updates
     */
    historyPathAdded(state, action: PayloadAction<string>) {
      state.paths.push(action.payload);
    },

    /**
     * Clear all history paths
     */
    historyCleared(state) {
      state.paths = [];
    },
  },
});

// Export actions
export const { historyPathAdded, historyCleared } = historySlice.actions;

// Export reducer
export default historySlice.reducer;
