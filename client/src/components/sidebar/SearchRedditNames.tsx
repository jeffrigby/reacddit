import { useMemo, useState, type ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { useDebounce } from 'use-debounce';
import { useAppSelector } from '@/redux/hooks';
import { useSearchSubredditsQuery } from '@/redux/api';
import { formatCompactNumber, formatNumber } from '@/common';
import { buildSubredditHref, TRIGGER_CLASS } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import { rankSubredditSearch } from './rankSubredditSearch';
import { useSubscribedNames } from './useFilteredSubreddits';
import { useNavSection } from './useNavSection';
import { useSidebarSelection } from './useSidebarSelection';
import { useSubredditSortPath } from './useSubredditSortPath';

/** Shortest term that is searched. */
const MIN_TERM_LENGTH = 2;
/** Pause after the last keystroke before a term is searched. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * Subreddits matching the filter text that the user isn't subscribed to.
 *
 * Reddit matches the term against subreddit names, titles and descriptions;
 * rankSubredditSearch orders the hits by name match then subscriber count.
 */
function SearchRedditNames(): ReactElement | null {
  const over18 = useAppSelector((state) => state.redditMe?.me?.over_18);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const auth = redditBearer.status === 'auth';
  const sortPath = useSubredditSortPath();

  const subscribedNames = useSubscribedNames();
  const { filterActive, filterText, selectedTarget } = useSidebarSelection();

  const initShowSearchResuts = over18 ?? false;
  const [showNSFW, setShowNSFW] = useState(initShowSearchResuts);

  const trimmedFilter = filterText.trim();
  const [debouncedFilter] = useDebounce(trimmedFilter, SEARCH_DEBOUNCE_MS);
  // The results on screen belong to the debounced term, so ranking and
  // rendering both key off it rather than the term being typed.
  const term = trimmedFilter.length < MIN_TERM_LENGTH ? '' : debouncedFilter;
  const skipSearch = term.length < MIN_TERM_LENGTH;

  // currentData is scoped to the term being requested: it is undefined while a
  // new term is in flight, so results are never ranked under a term they were
  // not fetched for.
  const { currentData: searchData } = useSearchSubredditsQuery(
    { query: term, includeOver18: showNSFW },
    { skip: skipSearch }
  );

  const ranked = useMemo(
    () => rankSubredditSearch(searchData?.data.children, term, subscribedNames),
    [searchData, term, subscribedNames]
  );

  // Hrefs are built once and used for both the anchors and the registry, so
  // the path keyboard navigation lands on is the path the link carries.
  const hrefs = useMemo(
    () =>
      ranked.map((result) =>
        buildSubredditHref(`r/${result.subreddit.display_name}`, sortPath)
      ),
    [ranked, sortPath]
  );

  useNavSection('search', hrefs);

  if (skipSearch || ranked.length === 0) {
    return null;
  }

  const firstRelated = ranked.findIndex((result) => result.tier === 'related');

  const navItems: ReactElement[] = [];
  ranked.forEach((result, idx) => {
    const { display_name: displayName, subscribers } = result.subreddit;

    if (idx === firstRelated && idx > 0) {
      navItems.push(
        <li aria-hidden="true" key="related-divider">
          <hr />
        </li>
      );
    }

    const href = hrefs[idx];
    const trigger = filterActive && href === selectedTarget;
    navItems.push(
      <li className="nav-item d-flex align-items-center" key={displayName}>
        <NavigationGenericNavItem
          noLi
          classes={trigger ? TRIGGER_CLASS : ''}
          id={`sr_search_${displayName}`}
          text={displayName}
          title={result.subreddit.title || displayName}
          to={href}
        />
        {subscribers != null && (
          <span
            className="search-subscribers"
            title={`${formatNumber(subscribers)} subscribers`}
          >
            {formatCompactNumber(subscribers)}
            <span className="visually-hidden"> subscribers</span>
          </span>
        )}
      </li>
    );
  });

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
