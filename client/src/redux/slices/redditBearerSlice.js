import { createSlice } from '@reduxjs/toolkit';

const initialState = { status: 'unloaded', bearer: null };

export const redditBearerSlice = createSlice({
  name: 'REDDIT_BEARER',
  initialState,
  reducers: {
    redditGetBearer(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
});

export const { redditGetBearer } = redditBearerSlice.actions;
export default redditBearerSlice.reducer;
