import { configureStore } from '@reduxjs/toolkit';
import type { PreloadedState } from '@reduxjs/toolkit';
import type { RootState } from '@/types/redux';
import * as subreddits from './reducers/subreddits';
import * as listings from './reducers/listings';
import siteSettingsSlice from './slices/siteSettingsSlice';
import historySlice from './slices/historySlice';
import multiRedditsReducer from './slices/multiRedditsSlice';
import bearerReducer from './slices/redditBearerSlice';
import meReducer from './slices/redditMeSlice';

const configureReduxStore = (initialState?: PreloadedState<RootState>) =>
  configureStore({
    reducer: {
      ...subreddits,
      ...listings,
      siteSettings: siteSettingsSlice,
      history: historySlice,
      redditMultiReddits: multiRedditsReducer,
      redditBearer: bearerReducer,
      redditMe: meReducer,
    },
    preloadedState: initialState,
  });

export default configureReduxStore;
