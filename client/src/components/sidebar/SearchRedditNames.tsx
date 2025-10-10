import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { searchSubreddits } from '@/reddit/redditApiTs';
import { useAppSelector } from '@/redux/hooks';
import { getSubredditKeys } from '@/redux/selectors/subredditSelectors';
import { buildSortPath } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';

interface SearchRedditNamesProps {
  filterText?: string;
}

/**
 * Get a list of subreddit names that match the filter text
 */
function useGetSubredditNames(filterText: string, showNSFW: boolean): string[] {
  const [searchResults, setSearchResults] = useState<string[]>([]);

  useEffect(() => {
    let ignore = false;

    const getResults = async () => {
      if (!filterText) {
        setSearchResults([]);
        return;
      }

      const results = await searchSubreddits(filterText, {
        include_over_18: showNSFW,
      });

      if (!ignore) {
        const { subreddits } = results;
        const names = subreddits.length
          ? subreddits.map((value) => value.name)
          : [];
        setSearchResults(names);
      }
    };

    getResults();

    return () => {
      ignore = true;
    };
  }, [filterText, showNSFW]);

  return searchResults;
}

/**
 * Display a list of subreddit names that match the filter text
 */
function SearchRedditNames({ filterText = '' }: SearchRedditNamesProps) {
  const over18 = useAppSelector((state) => state.redditMe?.me?.over_18);
  const subreddits = useAppSelector(getSubredditKeys);
  const sort = useAppSelector((state) => state.listingsFilter.sort);
  const auth = useAppSelector(
    (state) => state.redditBearer.status === 'auth' || false
  );
  const location = useLocation();

  const initShowSearchResuts = over18 ?? false;
  const [showNSFW, setShowNSFW] = useState(initShowSearchResuts);
  const searchResults = useGetSubredditNames(filterText, showNSFW);

  if (!filterText || searchResults.length === 0) {
    return null;
  }

  // Filter out subscribed reddits
  const lowerCaseSubreddits = subreddits.map((sub) => sub.toLowerCase());
  const filteredSubs = searchResults.filter(
    (value) => value && !lowerCaseSubreddits.includes(value.toLowerCase())
  );

  const query = queryString.parse(location.search);
  const { t } = query;
  const sortPath = buildSortPath(sort, t);

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
      <button
        className="btn btn-dark btn-sm m-0"
        title="Toggle NSFW Results"
        type="button"
        onClick={toggleNSFW}
      >
        {nsfwText}
      </button>
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
