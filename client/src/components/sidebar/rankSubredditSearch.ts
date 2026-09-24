import type { SubredditData, SubredditType, Thing } from '@/types/redditApi';
import type { SearchSort } from '@/redux/slices/siteSettingsSlice';

/** Characters a display name cannot contain, dropped from the search term. */
const NON_NAME_CHARS = /[^a-z0-9_]/g;

/**
 * Sort by subscriber count, highest first. Missing counts sort as 0.
 */
function bySubscribersDesc(a: SubredditData, b: SubredditData): number {
  return (b.subscribers ?? 0) - (a.subscribers ?? 0);
}

/** Sort by display name, case-insensitively. */
function byName(a: SubredditData, b: SubredditData): number {
  return a.display_name.localeCompare(b.display_name, undefined, {
    sensitivity: 'base',
  });
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
 * Only results whose display name contains the term are kept: Reddit also
 * matches titles and descriptions, and those hits read as noise next to name
 * matches. Subscribed subreddits, user profile subreddits and gated
 * subreddits the account cannot open are dropped too. Under 'relevance'
 * names starting with the term come first, then names containing it, each
 * group by subscriber count; the other sorts order the whole list by
 * subscribers or by name.
 *
 * @param children - Listing children from /subreddits/search
 * @param term - Search term, matched case-insensitively. Display names hold
 *   only [A-Za-z0-9_], so any other character in the term is ignored; a term
 *   with no name characters matches nothing.
 * @param subscribedNames - Lowercased display names already in the subscribed
 *   list, as the subreddit entity adapter keys them
 * @param sort - Order of the returned list
 * @returns Subreddits in that order
 */
export function rankSubredditSearch(
  children: Thing<SubredditData>[] | undefined,
  term: string,
  subscribedNames: ReadonlySet<string>,
  sort: SearchSort = 'relevance'
): SubredditData[] {
  const nameTerm = term.toLowerCase().replace(NON_NAME_CHARS, '');
  if (!children || nameTerm === '') {
    return [];
  }

  const prefix: SubredditData[] = [];
  const contains: SubredditData[] = [];

  for (const { data } of children) {
    const displayName = data.display_name;
    if (!displayName || data.subreddit_type === 'user' || isGated(data)) {
      continue;
    }
    const lowerName = displayName.toLowerCase();
    if (subscribedNames.has(lowerName)) {
      continue;
    }

    if (lowerName.startsWith(nameTerm)) {
      prefix.push(data);
    } else if (lowerName.includes(nameTerm)) {
      contains.push(data);
    }
  }

  prefix.sort(bySubscribersDesc);
  contains.sort(bySubscribersDesc);

  const ranked = [...prefix, ...contains];
  if (sort === 'subscribers') {
    ranked.sort(bySubscribersDesc);
  } else if (sort === 'name') {
    ranked.sort(byName);
  }
  return ranked;
}
