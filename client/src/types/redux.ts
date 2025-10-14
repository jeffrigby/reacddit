/**
 * Redux type definitions for the Reacddit client
 *
 * IMPORTANT: RootState, AppDispatch, and AppStore are now derived from the store itself
 * in configureStore.ts. Import them from there instead:
 *
 * @example
 * import type { RootState, AppDispatch, AppStore } from '@/redux/configureStore';
 *
 * This file re-exports types for backward compatibility with existing imports.
 */

/**
 * Re-export the canonical types from configureStore
 * This maintains backward compatibility for files that import from here
 */
export type { RootState, AppDispatch, AppStore } from '@/redux/configureStore';
