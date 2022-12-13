import { createSlice } from '@reduxjs/toolkit';

const initialState = { paths: [] };

const historySlice = createSlice({
  name: 'HISTORY',
  initialState,
  reducers: {
    setHistory(state, { payload }) {
      return {
        ...state,
        paths: state.paths.concat(payload),
      };
    },
  },
});

export const { setHistory } = historySlice.actions;

export default historySlice.reducer;
