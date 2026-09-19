import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Button, Form } from 'react-bootstrap';
import { useDebounce } from 'use-debounce';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  siteSettingsChanged,
  type SearchSort,
} from '@/redux/slices/siteSettingsSlice';
import {
  useSearchSubredditsQuery,
  useSubscribeToSubredditMutation,
} from '@/redux/api';
import { formatCompactNumber, formatNumber } from '@/common';
import {
  buildSubredditHref,
  navTargetDomId,
  TRIGGER_CLASS,
} from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import {
  rankSubredditSearch,
  type RankedSubreddit,
} from './rankSubredditSearch';
import SearchSubscribe from './SearchSubscribe';
import { useSubscribedNames } from './useFilteredSubreddits';
import { useNavSection } from './useNavSection';
import { useSidebarSelection } from './useSidebarSelection';
import { useSubredditSortPath } from './useSubredditSortPath';

/** Shortest term that is searched. */
const MIN_TERM_LENGTH = 2;
/** Pause after the last keystroke before a term is searched. */
const SEARCH_DEBOUNCE_MS = 250;

const SORT_LABELS: Record<SearchSort, string> = {
  relevance: 'Relevance',
  subscribers: 'Subscribers',
  name: 'A to Z',
};

/**
 * Subreddits whose name matches the filter text that the user isn't
 * subscribed to, in the order the search sort setting picks.
 */
function SearchRedditNames(): ReactElement | null {
  const over18 = useAppSelector((state) => state.redditMe?.me?.over_18);
  const searchSort = useAppSelector(
    (state) => state.siteSettings.searchSort ?? 'relevance'
  );
  const dispatch = useAppDispatch();
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const auth = redditBearer.status === 'auth';
  const sortPath = useSubredditSortPath();

  const subscribedNames = useSubscribedNames();
  const { filterActive, filterText, selectedTarget } = useSidebarSelection();

  // A successful subscribe invalidates the subscribed list, which refetches
  // and drops the row out of the results, so a row stays pending until it
  // goes; only a failure clears it.
  const [subscribeToSubreddit] = useSubscribeToSubredditMutation();
  const [pendingName, setPendingName] = useState<string | null>(null);
  const subscribe = useCallback(
    async (name: string) => {
      setPendingName(name);
      try {
        await subscribeToSubreddit({
          name,
          action: 'sub',
          type: 'sr',
        }).unwrap();
      } catch (error) {
        console.error('Subscribe failed:', error);
        setPendingName(null);
      }
    },
    [subscribeToSubreddit]
  );

  // Anonymous users toggle NSFW results by hand; signed-in users follow their
  // Reddit over_18 preference, which arrives with the account and can resolve
  // after this mounts.
  const [showNSFWAnon, setShowNSFWAnon] = useState(false);
  const showNSFW = auth ? (over18 ?? false) : showNSFWAnon;

  const trimmedFilter = filterText.trim();
  const [debouncedFilter] = useDebounce(trimmedFilter, SEARCH_DEBOUNCE_MS);
  // The results on screen belong to the debounced term, so ranking and
  // rendering both key off it rather than the term being typed.
  const term = trimmedFilter.length < MIN_TERM_LENGTH ? '' : debouncedFilter;
  const skipSearch = term.length < MIN_TERM_LENGTH;

  // currentData is scoped to the term being requested: it is undefined while a
  // new term is in flight, so results are never ranked under a term they were
  // not fetched for.
  const { currentData: searchData, isFetching } = useSearchSubredditsQuery(
    { query: term, includeOver18: showNSFW },
    { skip: skipSearch }
  );

  const ranked = useMemo(
    () =>
      rankSubredditSearch(
        searchData?.data.children,
        term,
        subscribedNames,
        searchSort
      ),
    [searchData, term, subscribedNames, searchSort]
  );

  // Ranking a term in flight yields nothing, so the last ranked list is held
  // and keeps rendering, faded, until the new one lands. The rows and the
  // hrefs registered from them survive a keystroke that way. A skipped search
  // is not in flight, so a term that falls under MIN_TERM_LENGTH empties this.
  const retained = useRef<RankedSubreddit[]>([]);
  if (!isFetching) {
    retained.current = ranked;
  }
  const results = retained.current;

  // Hrefs are built once and used for both the anchors and the registry, so
  // the path keyboard navigation lands on is the path the link carries.
  const hrefs = useMemo(
    () =>
      results.map((result) =>
        buildSubredditHref(`r/${result.subreddit.display_name}`, sortPath)
      ),
    [results, sortPath]
  );

  useNavSection('search', hrefs);

  if (results.length === 0) {
    return null;
  }

  const navItems: ReactElement[] = [];
  results.forEach((result, idx) => {
    const { display_name: displayName, name, subscribers } = result.subreddit;

    const href = hrefs[idx];
    const trigger = filterActive && href === selectedTarget;
    navItems.push(
      <li className="nav-item d-flex align-items-center" key={displayName}>
        <NavigationGenericNavItem
          noLi
          classes={trigger ? TRIGGER_CLASS : ''}
          id={navTargetDomId('search', href)}
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
        {auth && (
          <SearchSubscribe
            displayName={displayName}
            pending={pendingName === name}
            onSubscribe={() => subscribe(name)}
          />
        )}
      </li>
    );
  });

  const toggleNSFW = () => {
    setShowNSFWAnon((prev) => !prev);
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

  const resultsClass = isFetching ? 'nav flex-column faded' : 'nav flex-column';

  return (
    <div id="sidebar-search-results">
      <div className="sidebar-heading d-flex align-items-center text-muted">
        <span className="me-auto">Search</span>
        <Form.Select
          aria-label="Sort search results"
          className="search-sort w-auto py-0"
          size="sm"
          title="Sort search results"
          value={searchSort}
          onChange={(event) => {
            dispatch(
              siteSettingsChanged({
                searchSort: event.target.value as SearchSort,
              })
            );
          }}
        >
          {(Object.keys(SORT_LABELS) as SearchSort[]).map((sort) => (
            <option key={sort} value={sort}>
              {SORT_LABELS[sort]}
            </option>
          ))}
        </Form.Select>
      </div>
      <ul className={resultsClass}>{navItems}</ul>
      {nsfwButton}
    </div>
  );
}

export default SearchRedditNames;
