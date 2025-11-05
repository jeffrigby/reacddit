/**
 * Pre-typed Redux hooks for use throughout the application
 * Following Redux Toolkit 2.0+ best practices with .withTypes()
 *
 * IMPORTANT: Always use these hooks instead of the plain react-redux hooks:
 * - useAppSelector instead of useSelector
 * - useAppDispatch instead of useDispatch
 *
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './configureStore';

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
