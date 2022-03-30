import { createSlice } from '@reduxjs/toolkit';
import { redditGetBearer } from '../actions/reddit';

const initialState = { status: 'unloaded', bearer: null };

const redditBearerSlice = createSlice({
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
