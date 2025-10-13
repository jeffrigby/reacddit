import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import * as listings from './reducers/listings';
import siteSettingsSlice from './slices/siteSettingsSlice';
import historySlice from './slices/historySlice';
import subredditsReducer from './slices/subredditsSlice';
import multiRedditsReducer from './slices/multiRedditsSlice';
import bearerReducer from './slices/redditBearerSlice';
import meReducer from './slices/redditMeSlice';

const configureReduxStore = (initialState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: {
      ...listings,
      siteSettings: siteSettingsSlice,
      history: historySlice,
      subreddits: subredditsReducer,
      redditMultiReddits: multiRedditsReducer,
      redditBearer: bearerReducer,
      redditMe: meReducer,
    },
    preloadedState: initialState,
  });

export default configureReduxStore;
