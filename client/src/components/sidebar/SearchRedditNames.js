import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import queryString from 'query-string';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import RedditAPI from '../../reddit/redditAPI';

/**
 * Get a list of subreddit names that match the filter text
 * @param filterText {string} - The text to filter the subreddit names
 * @param showNSFW {boolean} - Whether to include NSFW subreddits
 * @returns {*[]} - An array of subreddit names
 */
function useGetSubredditNames(filterText, showNSFW) {
  const [searchResults, setSearchResults] = useState([]);
  useEffect(() => {
    let ignore = false;
    const getResults = async () => {
      if (!filterText) {
        setSearchResults([]);
        return;
      }

      const results = await RedditAPI.searchSubreddits(filterText, {
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
 * @param filterText {string} - The text to filter the subreddit names
 * @returns {JSX.Element|null}
 * @constructor
 */
const SearchRedditNames = ({ filterText = '' }) => {
  const over18 = useSelector((state) => state.redditMe.me.over_18);
  const subreddits = useSelector((state) =>
    state.subreddits.subreddits !== undefined
      ? Object.keys(state.subreddits.subreddits)
      : []
  );
  const sort = useSelector((state) => state.listingsFilter.sort);
  const auth = useSelector(
    (state) => state.redditBearer.status === 'auth' || false
  );

  const initShowSearchResuts = over18 !== undefined ? over18 : false;
  const [showNSFW, setShowNSFW] = useState(initShowSearchResuts);
  const searchResults = useGetSubredditNames(filterText, showNSFW);

  if (!filterText || searchResults.length === 0) {
    return null;
  }

  // Filter out subscribed reddits
  const filteredSubs = [];
  searchResults.forEach((value) => {
    if (subreddits.indexOf(value.toLowerCase()) === -1) {
      filteredSubs.push(value);
    }
  });

  let currentSort = sort || '';
  const query = queryString.parse(window.location.search);
  const { t } = query;

  switch (currentSort) {
    case 'top':
    case 'controversial':
      currentSort += `?t=${t}`;
      break;
    case 'relevance':
    case 'best':
    case 'comments':
      currentSort = '';
      break;
    default:
      break;
  }
  let navItems = [];
  if (filteredSubs.length > 0) {
    navItems = filteredSubs.map((value, idx) => {
      const key = `sr_search_${value}_${idx}`;
      const to = `/r/${value}/${currentSort}`;
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
    <div id="sidebar-subreddits">
      <div className="sidebar-heading d-flex text-muted">
        <span className="me-auto">Search</span>
      </div>
      <ul className="nav flex-column">{navItems}</ul>
      {nsfwButton}
    </div>
  );
};

SearchRedditNames.propTypes = {
  filterText: PropTypes.string,
};

export default SearchRedditNames;
