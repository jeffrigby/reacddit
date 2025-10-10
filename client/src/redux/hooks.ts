/**
 * Pre-typed Redux hooks for use throughout the application
 * Following Redux Toolkit 2.0+ best practices with .withTypes()
 * @see https://redux-toolkit.js.org/usage/usage-with-typescript#getting-the-dispatch-type
 */
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../types/redux';

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
