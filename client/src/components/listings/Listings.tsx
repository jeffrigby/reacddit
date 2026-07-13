import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  filterChanged,
  selectRefreshTrigger,
  statusUpdated,
} from '@/redux/slices/listingsSlice';
import { useListingsQuery } from '@/hooks/useListingsQuery';
import { useGetSubredditAboutQuery } from '@/redux/api';
import {
  ListingsContext,
  ListingsContextLastExpanded,
  ListingsFilterContext,
  useListingsActive,
} from '@/contexts';
import { getScrollContainer, hotkeyStatus, scrollToPosition } from '@/common';
import Posts from '@/components/posts/postsContainer/Posts';
import ListingsLogic from './ListingsLogic';
import ListingsHeader from './ListingsHeader';
import PostsDebug from './PostsDebug';
import '@/styles/listings.scss';

interface ListingsMatch {
  listType?: string;
  sort?: string;
  target?: string;
  user?: string;
  userType?: string;
  multi?: string | boolean;
  postName?: string;
  comment?: string;
}

interface ListingsProps {
  match: ListingsMatch;
}

function Listings({ match }: ListingsProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const isActive = useListingsActive();
  const [lastExpanded, setLastExpanded] = useState('');

  const { listType, sort, target, user, userType, multi, postName, comment } =
    match;

  // Build filter from match params
  const filters = useMemo(() => {
    let listingType: string;
    switch (listType) {
      case 'user':
        listingType = 'u';
        break;
      case 'multi':
        listingType = 'm';
        break;
      case 'search':
        listingType = 's';
        break;
      default:
        listingType = listType ?? 'r';
    }

    const getSort = sort ?? (target ? 'hot' : 'best');

    return {
      sort: getSort,
      target: target ?? 'mine',
      multi: multi === true || multi === 'm',
      userType: userType ?? '',
      user: user ?? '',
      listType: listingType,
      postName: postName ?? '',
      comment: comment ?? '',
    };
  }, [listType, sort, target, user, userType, multi, postName, comment]);

  // Fetch listings with RTK Query
  const { data, status, loadMore, loadNew, refetch, canLoadMore } =
    useListingsQuery(filters, location, { active: isActive });

  // Fetch subreddit about data (parallel query) - currently unused but may be needed for sidebar
  useGetSubredditAboutQuery({
    subreddit: target ?? '',
    listType: filters.listType,
    multi: filters.multi,
  });

  // Keep the global filter (Sort toolbar and other header singletons) in sync
  // with the ACTIVE tree only; useLayoutEffect so the frame after an overlay
  // closes never paints with the overlay's filter still applied.
  useLayoutEffect(() => {
    if (isActive) {
      dispatch(filterChanged(filters));
    }
  }, [dispatch, filters, isActive]);

  // Reset scroll only when this tree's own filters change (NOT on
  // reactivation after the overlay closes - the preserved offset must stay).
  useEffect(() => {
    scrollToPosition(0, 0);
    setLastExpanded('');
  }, [filters]);

  const locationKey = location.key || 'front';

  // Sync status to Redux for header components
  useEffect(() => {
    dispatch(statusUpdated({ locationKey, status }));
  }, [dispatch, locationKey, status]);

  // Listen for refresh requests from header
  const refreshTrigger = useAppSelector((state) =>
    selectRefreshTrigger(state, locationKey)
  );
  const refreshTriggerRef = useRef(refreshTrigger);

  useEffect(() => {
    if (refreshTrigger !== refreshTriggerRef.current && refreshTrigger > 0) {
      loadNew();
    }
    refreshTriggerRef.current = refreshTrigger;
  }, [refreshTrigger, loadNew]);

  // Hotkeys for manual refresh and scroll
  const hotkeys = useCallback(
    (event: KeyboardEvent) => {
      if (hotkeyStatus() && (status === 'loaded' || status === 'loadedAll')) {
        const pressedKey = event.key;
        try {
          switch (pressedKey) {
            case '.':
              scrollToPosition(0, 0);
              loadNew();
              break;
            case '/':
              scrollToPosition(0, getScrollContainer().scrollHeight);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('Error in listing hotkeys', e);
        }
      }
    },
    [status, loadNew]
  );

  useEffect(() => {
    if (!isActive) {
      return;
    }
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, [hotkeys, isActive]);

  // Prepare context values
  const lastExpandedContext = useMemo(
    () => [lastExpanded, setLastExpanded] as [string, (value: string) => void],
    [lastExpanded]
  );
  const listingsContextValue = useMemo(
    () => ({ data, loadMore, loadNew, refetch, status, canLoadMore }),
    [data, loadMore, loadNew, refetch, status, canLoadMore]
  );

  return (
    <ListingsContext value={listingsContextValue}>
      <ListingsFilterContext value={filters}>
        <ListingsContextLastExpanded value={lastExpandedContext}>
          {isActive && data?.originalPost && (
            <title>{`${data.originalPost.data.title} : ${data.originalPost.data.subreddit}`}</title>
          )}
          <div
            className="entries list-group"
            id={isActive ? 'entries' : undefined}
          >
            <ListingsHeader />
            <Posts key={locationKey} />
            <ListingsLogic saved={data?.saved ?? 0} />
          </div>
          {isActive && <PostsDebug />}
        </ListingsContextLastExpanded>
      </ListingsFilterContext>
    </ListingsContext>
  );
}

export default Listings;
