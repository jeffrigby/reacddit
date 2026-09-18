import { useSearchParams } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import { buildSortPath } from './navHelpers';

/**
 * Sort path segment the sidebar appends to subreddit links.
 *
 * Built from the listing sort and the `t` params on the current URL. A
 * multi-valued `t` carries no time filter.
 */
export function useSubredditSortPath(): string {
  const sort = useAppSelector((state) => state.listings.currentFilter.sort);
  const [searchParams] = useSearchParams();
  const tValues = searchParams.getAll('t');
  const timeFilter = tValues.length > 1 ? tValues : tValues[0];
  return buildSortPath(sort, timeFilter);
}
