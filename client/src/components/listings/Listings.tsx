import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  fetchListingsInitial,
  fetchListingsNew,
  filterChanged,
  selectListingData,
  selectListingStatus,
} from '@/redux/slices/listingsSlice';
import ListingsLogic from './ListingsLogic';
import { hotkeyStatus } from '../../common';
import ListingsHeader from './ListingsHeader';
import PostsDebug from './PostsDebug';
import '../../styles/listings.scss';
import Posts from '../posts/postsContainer/Posts';
import { ListingsContextLastExpanded } from '../../contexts';

interface ListingsMatch {
  listType?: string;
  sort?: string;
  target?: string;
  user?: string;
  userType?: string;
  multi?: string;
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

  const data = useAppSelector((state) =>
    selectListingData(state, location.key)
  );
  const status = useAppSelector((state) =>
    selectListingStatus(state, location.key)
  );
  const settings = useAppSelector((state) => state.siteSettings);
  const filter = useAppSelector((state) => state.listings.currentFilter);

  const { listType, sort, target, user, userType, multi, postName, comment } =
    match;

  // Set title for detail pages
  useEffect(() => {
    if (data.originalPost) {
      const origTitle = data.originalPost.data.title;
      const origSub = data.originalPost.data.subreddit;
      document.title = `${origTitle} : ${origSub}`;
    }
  }, [data.originalPost]);

  // Set the new filter.
  useEffect(() => {
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

    const newFilter = {
      sort: getSort,
      target: target ?? 'mine',
      multi: multi === 'm' || false,
      userType: userType ?? '',
      user: user ?? '',
      listType: listingType,
      postName: postName ?? '',
      comment: comment ?? '',
    };

    dispatch(filterChanged(newFilter));
  }, [
    listType,
    target,
    sort,
    user,
    userType,
    multi,
    location,
    dispatch,
    postName,
    comment,
  ]);

  // Get new posts if the filter changes.
  useEffect(() => {
    if (!filter.target) {
      return;
    }
    setLastExpanded('');
    dispatch(
      fetchListingsInitial({
        filters: filter,
        location,
        siteSettings: settings,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, dispatch]);

  // Check if I should stream entries
  useEffect(() => {
    const streamNewPosts = async () => {
      // Don't stream when you scroll down.
      if (window.scrollY > 10) {
        return;
      }
      dispatch(fetchListingsNew({ location, stream: true }));
    };

    let streamNewPostsInterval: NodeJS.Timeout | undefined;
    if (settings.stream) {
      streamNewPostsInterval = setInterval(streamNewPosts, 5000);
    }
    return () => {
      if (streamNewPostsInterval) {
        clearInterval(streamNewPostsInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.stream, dispatch]);

  // Set some hotkeys
  const hotkeys = useCallback(
    (event: KeyboardEvent) => {
      if (hotkeyStatus() && (status === 'loaded' || status === 'loadedAll')) {
        const pressedKey = event.key;
        try {
          switch (pressedKey) {
            case '.':
              window.scrollTo(0, 0);
              dispatch(fetchListingsNew({ location }));
              break;
            case '/':
              window.scrollTo(0, document.body.scrollHeight);
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('Error in listing hotkeys', e);
        }
      }
    },
    [status, location, dispatch]
  );

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, [hotkeys]);

  const locationKey = location.key || 'front';
  const context = useMemo(
    () => [lastExpanded, setLastExpanded],
    [lastExpanded]
  );

  return (
    <ListingsContextLastExpanded.Provider value={context}>
      <div className="list-group" id="entries">
        <ListingsHeader />
        <Posts key={locationKey} />
        <ListingsLogic saved={data.saved} />
      </div>
      <PostsDebug />
    </ListingsContextLastExpanded.Provider>
  );
}

export default Listings;
