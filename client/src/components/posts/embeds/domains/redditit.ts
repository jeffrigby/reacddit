/**
 * Handler for redd.it short links
 *
 * This is an alias that delegates to the redditcom handler.
 * redd.it links redirect to reddit.com, so we use the same logic.
 */
import render from './redditcom';

export default render;
