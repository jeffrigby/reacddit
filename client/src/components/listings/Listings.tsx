import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  filterChanged,
  selectRefreshTrigger,
  statusUpdated,
} from '@/redux/slices/listingsSlice';
import { useListingsQuery } from '@/hooks/useListingsQuery';
import { useGetSubredditAboutQuery } from '@/redux/api';
import { ListingsContext, ListingsContextLastExpanded } from '@/contexts';
import { hotkeyStatus } from '@/common';
import { scrollToPosition } from '@/components/posts/PostsFunctions';
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
  const [lastExpanded, setLastExpanded] = useState('');

  const { listType, sort, target, user, userType, multi, postName, comment } =
    match;

  // Build filter from match params
  const filters = useMemo(() => {
    let listingType = listType ?? 'r';
    if (listType === 'user') {
      listingType = 'u';
    }
    if (listType === 'multi') {
      listingType = 'm';
    }
    if (listType === 'search') {
      listingType = 's';
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
    useListingsQuery(filters, location);

  // Fetch subreddit about data (parallel query) - currently unused but may be needed for sidebar
  useGetSubredditAboutQuery({
    subreddit: target ?? '',
    listType: filters.listType,
    multi: filters.multi,
  });

  // Update document title for comments/duplicates view
  useEffect(() => {
    if (data?.originalPost) {
      const origTitle = data.originalPost.data.title;
      const origSub = data.originalPost.data.subreddit;
      document.title = `${origTitle} : ${origSub}`;
    }
  }, [data?.originalPost]);

  // Update filter and status in slice when match params or status change
  useEffect(() => {
    scrollToPosition(0, 0);
    dispatch(filterChanged(filters));
    setLastExpanded('');
  }, [dispatch, filters]);

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
              scrollToPosition(0, document.body.scrollHeight);
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
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, [hotkeys]);

  // Prepare context values
  const lastExpandedContext = useMemo(
    () => [lastExpanded, setLastExpanded],
    [lastExpanded]
  );
  const listingsContextValue = useMemo(
    () => ({ data, loadMore, loadNew, refetch, status, canLoadMore }),
    [data, loadMore, loadNew, refetch, status, canLoadMore]
  );

  return (
    <ListingsContext.Provider value={listingsContextValue}>
      <ListingsContextLastExpanded.Provider value={lastExpandedContext}>
        <div className="list-group" id="entries">
          <ListingsHeader />
          <Posts key={locationKey} />
          <ListingsLogic saved={data?.saved ?? 0} />
        </div>
        <PostsDebug />
      </ListingsContextLastExpanded.Provider>
    </ListingsContext.Provider>
  );
}

export default Listings;
