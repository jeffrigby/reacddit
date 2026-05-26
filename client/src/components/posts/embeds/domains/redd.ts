/**
 * Handler for redd.it short links (redd.it, i.redd.it, v.redd.it).
 *
 * The filename intentionally matches the registry key 'redd' — getKeys()
 * resolves redd.it to greedyDomain 'redd' (and domain 'reddit'), so this file
 * must be named redd.ts for tryDomainHandlers to pick it up. reddit.com resolves
 * to greedyDomain 'reddit' / domain 'redditcom' and is handled by redditcom.ts,
 * so there is no collision.
 *
 * This is an alias that delegates to the redditcom handler:
 * redd.it links redirect to reddit.com, so we reuse the same logic.
 */
import render from './redditcom';

export default render;
