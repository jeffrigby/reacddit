import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { useAppSelector } from '@/redux/hooks';
import {
  useGetSubredditsQuery,
  subredditSelectors,
  useSearchSubredditsByNameQuery,
} from '@/redux/api';
import { buildSortPath } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';

interface SearchRedditNamesProps {
  filterText?: string;
}

/**
 * Display a list of subreddit names that match the filter text
 */
function SearchRedditNames({ filterText = '' }: SearchRedditNamesProps) {
  const over18 = useAppSelector((state) => state.redditMe?.me?.over_18);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const sort = useAppSelector((state) => state.listings.currentFilter.sort);
  const auth = redditBearer.status === 'auth' || false;
  const location = useLocation();

  const where = redditBearer.status === 'anon' ? 'default' : 'subscriber';

  // Use RTK Query hook to get subreddit IDs
  const { subredditIds } = useGetSubredditsQuery(
    { where },
    {
      selectFromResult: ({ data }) => ({
        subredditIds: data ? subredditSelectors.selectIds(data) : [],
      }),
    }
  );

  const initShowSearchResuts = over18 ?? false;
  const [showNSFW, setShowNSFW] = useState(initShowSearchResuts);

  // Use RTK Query hook to search for subreddits
  const { data: searchData } = useSearchSubredditsByNameQuery(
    { query: filterText, includeOver18: showNSFW },
    { skip: !filterText }
  );

  const searchResults =
    searchData?.subreddits.map((subreddit) => subreddit.name) ?? [];

  if (!filterText || searchResults.length === 0) {
    return null;
  }

  // Filter out subscribed reddits
  const lowerCaseSubreddits = subredditIds.map((sub) =>
    String(sub).toLowerCase()
  );
  const filteredSubs = searchResults.filter(
    (value) => value && !lowerCaseSubreddits.includes(value.toLowerCase())
  );

  const query = queryString.parse(location.search);
  const { t } = query;
  const sortPath = buildSortPath(sort, typeof t === 'string' ? t : undefined);

  let navItems: React.ReactElement[] = [];
  if (filteredSubs.length > 0) {
    navItems = filteredSubs.map((value, idx) => {
      const key = `sr_search_${value}_${idx}`;
      const to = `/r/${value}/${sortPath}`;
      return (
        <NavigationGenericNavItem id={key} key={key} text={value} to={to} />
      );
    });
  }

  if (navItems.length === 0) {
    return null;
  }

  const toggleNSFW = () => {
    setShowNSFW(!showNSFW);
  };

  const nsfwText = showNSFW ? 'Hide NSFW' : 'Show NSFW';
  const nsfwButton = !auth ? (
    <div className="pt-1 small">
      <Button
        className="m-0"
        size="sm"
        title="Toggle NSFW Results"
        variant="dark"
        onClick={toggleNSFW}
      >
        {nsfwText}
      </Button>
    </div>
  ) : null;

  return (
    <div id="sidebar-search-results">
      <div className="sidebar-heading d-flex text-muted">
        <span className="me-auto">Search</span>
      </div>
      <ul className="nav flex-column">{navItems}</ul>
      {nsfwButton}
    </div>
  );
}

export default SearchRedditNames;
