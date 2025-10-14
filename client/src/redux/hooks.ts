/**
 * Pre-typed Redux hooks for use throughout the application
 * Following Redux Toolkit 2.0+ best practices with .withTypes()
 *
 * IMPORTANT: Always use these hooks instead of the plain react-redux hooks:
 * - useAppSelector instead of useSelector
 * - useAppDispatch instead of useDispatch
 * - useAppStore instead of useStore
 *
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
import { useDispatch, useSelector, useStore } from 'react-redux';
import type { RootState, AppDispatch, AppStore } from './configureStore';

/**
 * Use throughout the app instead of plain `useDispatch`
 * This hook already knows about thunks and middleware
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Use throughout the app instead of plain `useSelector`
 * No need to type RootState on every usage
 */
export const useAppSelector = useSelector.withTypes<RootState>();

/**
 * Use throughout the app instead of plain `useStore`
 * Provides access to the store instance with full type safety
 */
export const useAppStore = useStore.withTypes<AppStore>();
