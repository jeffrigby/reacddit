import type { SubredditData, SubredditType, Thing } from '@/types/redditApi';

/**
 * Tier a search result falls into, most relevant first:
 * - prefix: display name starts with the search term
 * - contains: display name contains the search term elsewhere
 * - related: matched on title or description only
 */
export type SubredditSearchTier = 'prefix' | 'contains' | 'related';

export interface RankedSubreddit {
  subreddit: SubredditData;
  tier: SubredditSearchTier;
}

/** Results matching on title/description only are capped at this many. */
export const RELATED_TIER_LIMIT = 5;

/** Characters a display name cannot contain, dropped from the search term. */
const NON_NAME_CHARS = /[^a-z0-9_]/g;

/**
 * Sort by subscriber count, highest first. Missing counts sort as 0.
 */
function bySubscribersDesc(a: RankedSubreddit, b: RankedSubreddit): number {
  return (b.subreddit.subscribers ?? 0) - (a.subreddit.subscribers ?? 0);
}

/** Subreddit types only some accounts may open. */
const GATED_TYPES: ReadonlySet<SubredditType> = new Set<SubredditType>([
  'private',
  'gold_only',
  'employees_only',
]);

/**
 * Whether the account cannot open a subreddit search returned. A gated
 * subreddit is open to an approved member; a subscriber would already be in
 * the subscribed list.
 */
function isGated(data: SubredditData): boolean {
  return (
    GATED_TYPES.has(data.subreddit_type) &&
    data.user_is_contributor !== true &&
    data.user_is_subscriber !== true
  );
}

/**
 * Rank subreddit search results for the sidebar.
 *
 * Subscribed subreddits, user profile subreddits and gated subreddits the
 * account cannot open are dropped; the rest are
 * bucketed by how the display name matches the term and each bucket is sorted
 * by subscriber count. Prefix and contains matches are returned in full, the
 * related tier is capped at RELATED_TIER_LIMIT.
 *
 * @param children - Listing children from /subreddits/search
 * @param term - Search term, matched case-insensitively. Display names hold
 *   only [A-Za-z0-9_], so any other character in the term is ignored when
 *   matching names; a term with no name characters leaves every result in the
 *   related tier.
 * @param subscribedNames - Lowercased display names already in the subscribed
 *   list, as the subreddit entity adapter keys them
 * @returns Ranked results, most relevant first
 */
export function rankSubredditSearch(
  children: Thing<SubredditData>[] | undefined,
  term: string,
  subscribedNames: ReadonlySet<string>
): RankedSubreddit[] {
  const searchTerm = term.trim().toLowerCase();
  if (!children || searchTerm === '') {
    return [];
  }
  const nameTerm = searchTerm.replace(NON_NAME_CHARS, '');

  const prefix: RankedSubreddit[] = [];
  const contains: RankedSubreddit[] = [];
  const related: RankedSubreddit[] = [];

  for (const { data } of children) {
    const displayName = data.display_name;
    if (!displayName || data.subreddit_type === 'user' || isGated(data)) {
      continue;
    }
    const lowerName = displayName.toLowerCase();
    if (subscribedNames.has(lowerName)) {
      continue;
    }

    if (nameTerm !== '' && lowerName.startsWith(nameTerm)) {
      prefix.push({ subreddit: data, tier: 'prefix' });
    } else if (nameTerm !== '' && lowerName.includes(nameTerm)) {
      contains.push({ subreddit: data, tier: 'contains' });
    } else {
      related.push({ subreddit: data, tier: 'related' });
    }
  }

  prefix.sort(bySubscribersDesc);
  contains.sort(bySubscribersDesc);
  related.sort(bySubscribersDesc);

  return [...prefix, ...contains, ...related.slice(0, RELATED_TIER_LIMIT)];
}
