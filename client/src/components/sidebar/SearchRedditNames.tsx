import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from 'react';
import { Button } from 'react-bootstrap';
import { faArrowRight, faUser } from '@fortawesome/free-solid-svg-icons';
import { useDebounce } from 'use-debounce';
import { useAppSelector } from '@/redux/hooks';
import {
  useSearchSubredditNamesQuery,
  useSearchSubredditsQuery,
  useSearchUsersQuery,
  useSubscribeToSubredditMutation,
  useUsernameAvailableQuery,
} from '@/redux/api';
import { formatCompactNumber, formatNumber } from '@/common';
import type { AccountData } from '@/types/redditApi';
import {
  buildSubredditHref,
  navTargetDomId,
  TRIGGER_CLASS,
} from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import {
  nameTermOf,
  rankSubredditSearch,
  rankUserSearch,
  verifiedDirect,
} from './rankSubredditSearch';
import SearchSubscribe from './SearchSubscribe';
import { useSubscribedNames } from './useFilteredSubreddits';
import { useNavSection } from './useNavSection';
import { useSidebarSelection } from './useSidebarSelection';
import { useSubredditSortPath } from './useSubredditSortPath';

/** Shortest term that is searched. */
const MIN_TERM_LENGTH = 2;
/** Shortest name Reddit will check with /api/username_available. */
const MIN_USERNAME_LENGTH = 3;
/** Pause after the last keystroke before a term is searched. */
const SEARCH_DEBOUNCE_MS = 250;

/** One rendered row of the section, in registry order. */
interface SearchRow {
  key: string;
  href: string;
  text: string;
  title: string;
  icon?: typeof faUser;
  /** Number shown on the right: subscribers or karma */
  count?: number | null;
  countLabel?: string;
  /** Subreddit fullname, when the row can be subscribed to */
  subscribable?: string;
}

/**
 * Subreddits and users matching the filter text.
 *
 * Reddit matches the term against subreddit names, titles and descriptions;
 * rankSubredditSearch orders the hits by name match then subscriber count.
 * Two exact-name checks fill the gaps search leaves: a subreddit that is
 * private or unindexed is confirmed through /api/search_reddit_names, and a
 * user that profile search misses is confirmed through
 * /api/username_available. Every row leads somewhere that exists.
 */
function SearchRedditNames(): ReactElement | null {
  const over18 = useAppSelector((state) => state.redditMe?.me?.over_18);
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

  const nameTerm = nameTermOf(term);
  const skipUsername = skipSearch || nameTerm.length < MIN_USERNAME_LENGTH;

  // currentData is scoped to the term being requested: it is undefined while a
  // new term is in flight, so results are never ranked under a term they were
  // not fetched for. The four requests run in parallel.
  const { currentData: searchData, isFetching: fetchingSubs } =
    useSearchSubredditsQuery(
      { query: term, includeOver18: showNSFW },
      { skip: skipSearch }
    );
  const { currentData: namesData, isFetching: fetchingNames } =
    useSearchSubredditNamesQuery(
      { query: nameTerm, includeOver18: showNSFW },
      { skip: skipSearch || nameTerm === '' }
    );
  const { currentData: usersData, isFetching: fetchingUsers } =
    useSearchUsersQuery({ query: term }, { skip: skipSearch });
  const { currentData: usernameAvailable, isFetching: fetchingUsername } =
    useUsernameAvailableQuery({ user: nameTerm }, { skip: skipUsername });
  const isFetching =
    fetchingSubs || fetchingNames || fetchingUsers || fetchingUsername;

  const ranked = useMemo(
    () => rankSubredditSearch(searchData?.data.children, term, subscribedNames),
    [searchData, term, subscribedNames]
  );
  const rankedUsers = useMemo(
    () => rankUserSearch(usersData?.data.children, nameTerm),
    [usersData, nameTerm]
  );
  const direct = useMemo(
    () =>
      verifiedDirect(
        nameTerm,
        subscribedNames,
        ranked,
        namesData?.names,
        rankedUsers,
        usernameAvailable
      ),
    [
      nameTerm,
      subscribedNames,
      ranked,
      namesData,
      rankedUsers,
      usernameAvailable,
    ]
  );

  // Hrefs are built once and used for both the anchors and the registry, so
  // the path keyboard navigation lands on is the path the link carries.
  const assembled = useMemo(() => {
    const rows: SearchRow[] = [];
    if (direct.subreddit) {
      rows.push({
        key: 'direct-r',
        href: buildSubredditHref(`r/${direct.subreddit}`, sortPath),
        text: `r/${direct.subreddit}`,
        title: `Go to r/${direct.subreddit}`,
        icon: faArrowRight,
      });
    }
    ranked.forEach((result) => {
      const {
        display_name: displayName,
        name,
        subscribers,
        title,
      } = result.subreddit;
      rows.push({
        key: `r-${displayName}`,
        href: buildSubredditHref(`r/${displayName}`, sortPath),
        text: displayName,
        title: title || displayName,
        count: subscribers,
        countLabel: 'subscribers',
        subscribable: name,
      });
    });
    const userRows: SearchRow[] = [];
    if (direct.user) {
      userRows.push({
        key: 'direct-u',
        href: `/user/${direct.user}/posts`,
        text: `u/${direct.user}`,
        title: `Go to u/${direct.user}`,
        icon: faUser,
      });
    }
    rankedUsers.forEach((user: AccountData) => {
      userRows.push({
        key: `u-${user.name}`,
        href: `/user/${user.name}/posts`,
        text: `u/${user.name}`,
        title: `Go to u/${user.name}`,
        icon: faUser,
        count: user.link_karma + user.comment_karma,
        countLabel: 'karma',
      });
    });
    return {
      rows: [...rows, ...userRows],
      firstRelated: rows.findIndex((row) =>
        ranked.some(
          (result) =>
            result.tier === 'related' &&
            row.key === `r-${result.subreddit.display_name}`
        )
      ),
      firstUser: userRows.length > 0 ? rows.length : -1,
    };
  }, [direct, ranked, rankedUsers, sortPath]);

  // Ranking a term in flight yields nothing, so the last assembled list is
  // held and keeps rendering, faded, until the new one lands. The rows and
  // the hrefs registered from them survive a keystroke that way. A skipped
  // search is not in flight, so a term under MIN_TERM_LENGTH empties this.
  const retained = useRef(assembled);
  if (!isFetching) {
    retained.current = assembled;
  }
  const { rows, firstRelated, firstUser } = retained.current;

  const hrefs = useMemo(() => rows.map((row) => row.href), [rows]);

  useNavSection('search', hrefs);

  if (rows.length === 0) {
    return null;
  }

  const navItems: ReactElement[] = [];
  rows.forEach((row, idx) => {
    if ((idx === firstRelated || idx === firstUser) && idx > 0) {
      navItems.push(
        <li aria-hidden="true" key={`divider-before-${row.key}`}>
          <hr />
        </li>
      );
    }

    const { href } = row;
    const trigger = filterActive && href === selectedTarget;
    navItems.push(
      <li className="nav-item d-flex align-items-center" key={row.key}>
        <NavigationGenericNavItem
          noLi
          classes={trigger ? TRIGGER_CLASS : ''}
          icon={row.icon}
          id={navTargetDomId('search', href)}
          text={row.text}
          title={row.title}
          to={href}
        />
        {row.count != null && (
          <span
            className="search-subscribers"
            title={`${formatNumber(row.count)} ${row.countLabel}`}
          >
            {formatCompactNumber(row.count)}
            <span className="visually-hidden"> {row.countLabel}</span>
          </span>
        )}
        {auth && row.subscribable && (
          <SearchSubscribe
            displayName={row.text}
            pending={pendingName === row.subscribable}
            onSubscribe={() => subscribe(row.subscribable as string)}
          />
        )}
      </li>
    );
  });

  const toggleNSFW = () => {
    setShowNSFWAnon((prev) => !prev);
  };

  const nsfwText = showNSFW ? 'Hide NSFW' : 'Show NSFW';
  const nsfwButton =
    !auth && ranked.length > 0 ? (
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
      <div className="sidebar-heading d-flex text-muted">
        <span className="me-auto">Search</span>
      </div>
      <ul className={resultsClass}>{navItems}</ul>
      {nsfwButton}
    </div>
  );
}

export default SearchRedditNames;
