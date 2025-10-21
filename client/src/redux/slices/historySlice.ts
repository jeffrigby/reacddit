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

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    historyPathAdded(state, action: PayloadAction<string>) {
      state.paths.push(action.payload);
    },

    historyCleared(state) {
      state.paths = [];
    },
  },
});

export const { historyPathAdded, historyCleared } = historySlice.actions;

export default historySlice.reducer;
