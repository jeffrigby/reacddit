/**
 * Redux API barrel file
 *
 * This file re-exports the base API and all endpoint hooks.
 * Import from this file in components to avoid circular dependencies.
 *
 * IMPORTANT: Always import from this file, not from redditApi.ts directly,
 * to ensure endpoints are injected before hooks are used.
 */

// Import base API (must be first)
export { redditApi, redditApiReducer, redditApiMiddleware } from './redditApi';

// Import endpoints to ensure they're injected
import './endpoints/multiReddits';
import './endpoints/me';
import './endpoints/votes';
import './endpoints/subreddits';
import './endpoints/subredditsQuery';
import './endpoints/listings';
import './endpoints/search';
import './endpoints/comments';

// Re-export hooks from endpoints
export * from './endpoints/multiReddits';
export * from './endpoints/me';
export * from './endpoints/votes';
export * from './endpoints/subreddits';
export * from './endpoints/subredditsQuery';
export * from './endpoints/listings';
export * from './endpoints/search';
export * from './endpoints/comments';
