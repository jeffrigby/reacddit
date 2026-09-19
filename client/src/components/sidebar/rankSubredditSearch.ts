import type { AccountData, SubredditData, Thing } from '@/types/redditApi';

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
 * The part of a search term that can be a subreddit or user name: lowercased,
 * with every character a name cannot hold removed.
 */
export function nameTermOf(term: string): string {
  return term.trim().toLowerCase().replace(NON_NAME_CHARS, '');
}

/** Users offered per search. */
export const USER_RESULT_LIMIT = 5;

/**
 * Rank user search results for the sidebar.
 *
 * /users/search is a text search over profile content, so it returns names
 * that merely mention the term. Names starting with the term come first,
 * then the rest in Reddit's order; suspended accounts are dropped.
 *
 * @param children - Listing children from /users/search
 * @param nameTerm - Term reduced by nameTermOf
 * @returns At most USER_RESULT_LIMIT accounts, most relevant first
 */
export function rankUserSearch(
  children: Thing<AccountData>[] | undefined,
  nameTerm: string
): AccountData[] {
  if (!children || nameTerm === '') {
    return [];
  }
  const prefix: AccountData[] = [];
  const rest: AccountData[] = [];
  for (const { data } of children) {
    if (data.is_suspended) {
      continue;
    }
    (data.name.toLowerCase().startsWith(nameTerm) ? prefix : rest).push(data);
  }
  return [...prefix, ...rest].slice(0, USER_RESULT_LIMIT);
}

/** Exact-name destinations confirmed by Reddit that no result row covers. */
export interface VerifiedDirect {
  /** Subreddit name as Reddit spells it, or null */
  subreddit: string | null;
  /** User name as typed, or null */
  user: string | null;
}

/**
 * The typed name as a subreddit and as a user, each only when Reddit
 * confirms it exists and no row on screen already leads there.
 *
 * @param nameTerm - Term reduced by nameTermOf
 * @param subscribedNames - Lowercased subscribed display names
 * @param results - Ranked subreddit results on screen
 * @param subredditNames - Names from /api/search_reddit_names, if loaded
 * @param users - Ranked user results on screen
 * @param usernameAvailable - /api/username_available for nameTerm, if loaded
 */
export function verifiedDirect(
  nameTerm: string,
  subscribedNames: ReadonlySet<string>,
  results: RankedSubreddit[],
  subredditNames: string[] | undefined,
  users: AccountData[],
  usernameAvailable: boolean | undefined
): VerifiedDirect {
  if (nameTerm === '') {
    return { subreddit: null, user: null };
  }
  const listedSub =
    subscribedNames.has(nameTerm) ||
    results.some(
      (result) => result.subreddit.display_name.toLowerCase() === nameTerm
    );
  const confirmedSub = listedSub
    ? undefined
    : subredditNames?.find((name) => name.toLowerCase() === nameTerm);

  const listedUser = users.some((user) => user.name.toLowerCase() === nameTerm);
  const confirmedUser = !listedUser && usernameAvailable === false;

  return {
    subreddit: confirmedSub ?? null,
    user: confirmedUser ? nameTerm : null,
  };
}

/**
 * Sort by subscriber count, highest first. Missing counts sort as 0.
 */
function bySubscribersDesc(a: RankedSubreddit, b: RankedSubreddit): number {
  return (b.subreddit.subscribers ?? 0) - (a.subreddit.subscribers ?? 0);
}

/**
 * Rank subreddit search results for the sidebar.
 *
 * Subscribed subreddits and user profile subreddits are dropped; the rest are
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
  if (!children || term.trim() === '') {
    return [];
  }
  const nameTerm = nameTermOf(term);

  const prefix: RankedSubreddit[] = [];
  const contains: RankedSubreddit[] = [];
  const related: RankedSubreddit[] = [];

  for (const { data } of children) {
    const displayName = data.display_name;
    if (!displayName || data.subreddit_type === 'user') {
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
