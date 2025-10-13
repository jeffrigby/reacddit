import { useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { listingsState } from '../../redux/actions/listings';
import {
  listingState,
  listingStatus,
} from '../../redux/selectors/listingsSelector';
import { ListingsContextLastExpanded } from '../../contexts';
import {
  getCurrentListingState,
  unfocusIFrame,
  autoPlayVideos,
  nextEntry,
  nextEntryCollapsed,
  prevEntry,
  prevEntryCollapsed,
} from '../posts/PostsFunctions';
import { hotkeyStatus } from '../../common';
import type { ListingsState } from '../../types/listings';

interface ListingsLogicProps {
  saved?: number;
}

/**
 * Extended listing state with lastExpanded for tracking in condensed view
 */
interface ExtendedListingsState extends ListingsState {
  lastExpanded?: string;
}

function ListingsLogic({ saved = 0 }: ListingsLogicProps) {
  const location = useLocation();
  // Get Redux Props
  const status = useAppSelector((state) => listingStatus(state, location.key));
  const settings = useAppSelector((state) => state.siteSettings);
  const locationKey = location.key;
  const listingsCurrentState = useAppSelector((state) =>
    listingState(state, location.key)
  ) as ExtendedListingsState;

  // Keep latest props in a ref.
  const prevState = useRef<ExtendedListingsState>(listingsCurrentState);
  const prevView = useRef(settings.view);
  const scrollResize = useRef(true);

  const contextValue = useContext(ListingsContextLastExpanded);
  // Type guard to check if we have the tuple [string, function]
  const [lastExpanded, setLastExpanded] = Array.isArray(contextValue)
    ? (contextValue as [string, (value: string) => void])
    : (['', () => {}] as [string, (value: string) => void]);

  const dispatch = useAppDispatch();

  const setLastExpandedRedux = useCallback(
    (expandedId: string) => {
      if (expandedId) {
        const newState = { ...listingsCurrentState };
        newState.lastExpanded = expandedId;
        const key = locationKey || 'front';
        dispatch(listingsState(key, newState));
      }
    },
    [listingsCurrentState, locationKey, dispatch]
  );

  const next = useCallback(() => {
    if (settings.view === 'expanded') {
      nextEntry(listingsCurrentState.focused);
    } else {
      const nextId = nextEntryCollapsed(lastExpanded, setLastExpanded);
      if (nextId) {
        setLastExpandedRedux(nextId);
      }
    }
  }, [
    settings.view,
    listingsCurrentState.focused,
    lastExpanded,
    setLastExpanded,
    setLastExpandedRedux,
  ]);

  const prev = useCallback(() => {
    if (settings.view === 'expanded') {
      prevEntry(listingsCurrentState.focused);
    } else {
      const prevId = prevEntryCollapsed(lastExpanded, setLastExpanded);
      if (prevId) {
        setLastExpandedRedux(prevId);
      }
    }
  }, [
    settings.view,
    listingsCurrentState.focused,
    lastExpanded,
    setLastExpanded,
    setLastExpandedRedux,
  ]);

  // Set some hotkeys
  const hotkeys = useCallback(
    (event: KeyboardEvent) => {
      if (hotkeyStatus() && (status === 'loaded' || status === 'loadedAll')) {
        const pressedKey = event.key;
        try {
          switch (pressedKey) {
            case 'j':
              next();
              break;

            case 'k':
              prev();
              break;
            default:
              break;
          }
        } catch (e) {
          console.error('Error in listing hotkeys', e);
        }
      }
    },
    [status, next, prev]
  );

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, [hotkeys]);

  const monitorEntries = useCallback(() => {
    if (!scrollResize.current) {
      return;
    }

    const postsCollection = document.getElementsByClassName('entry');
    if (postsCollection.length === 0) {
      return;
    }
    scrollResize.current = false;

    // getCurrentListingState only needs focused and actionable properties
    // Ensure actionable is string | null (not number)
    const simplifiedState = {
      focused: prevState.current.focused,
      actionable:
        typeof prevState.current.actionable === 'string'
          ? prevState.current.actionable
          : null,
    };
    const partialState = getCurrentListingState(
      simplifiedState,
      settings.view ?? 'expanded',
      lastExpanded
    );

    // Merge the partial state from getCurrentListingState with existing state
    const newState: ExtendedListingsState = {
      ...prevState.current,
      ...(partialState as { focused: string; actionable: string | null }),
    };

    const key = locationKey || 'front';

    const compareState: Partial<ExtendedListingsState> = {
      ...prevState.current,
    };
    delete compareState.saved;

    const stateCompare = isEqual(compareState, newState);
    if (!stateCompare) {
      dispatch(listingsState(key, newState));
      prevState.current = newState;
    }

    // Check if iframe is focused. If it is, unfocus it so hotkeys work.
    unfocusIFrame();

    if (settings.autoplay) {
      // This is for a weird iOS/PWA bug that occasionally stops videos.
      autoPlayVideos();
    }

    scrollResize.current = true;
  }, [dispatch, lastExpanded, locationKey, settings.autoplay, settings.view]);

  // Use ResizeObserver to trigger updates when DOM changes instead of polling with setTimeout
  const forceDelayedUpdate = useCallback(() => {
    monitorEntries();
    // Single delayed update to catch any late-rendering content
    setTimeout(monitorEntries, 500);
  }, [monitorEntries]);

  const { view } = settings;

  useEffect(() => {
    if (prevView.current === view) {
      return;
    }
    forceDelayedUpdate();
    prevView.current = view;
  }, [forceDelayedUpdate, view]);

  // Monitor Entries
  // Note: We use scroll/resize listeners here (not IntersectionObserver) because we need
  // precise pixel-based calculations for focus/actionable state. IntersectionObserver
  // works with thresholds and rootMargin but can't provide the exact positioning logic
  // needed for keyboard navigation and the condensed view mode.
  const throttledUpdate = useMemo(
    () => throttle(monitorEntries, 500),
    [monitorEntries]
  );

  useEffect(() => {
    forceDelayedUpdate();
    window.addEventListener('resize', throttledUpdate, false);
    document.addEventListener('scroll', throttledUpdate, false);

    return () => {
      window.removeEventListener('resize', throttledUpdate, false);
      document.removeEventListener('scroll', throttledUpdate, false);
    };
  }, [forceDelayedUpdate, throttledUpdate]);

  // Monitor iframe focus on user interaction instead of polling
  useEffect(() => {
    const handleUserInteraction = () => {
      // Check if iframe is focused. If it is, unfocus it so hotkeys work.
      unfocusIFrame();
    };

    // Check on common user interactions instead of polling
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  // Effect to trigger monitor if the saved arg changes.
  // This is to make sure newly fetched entries render.
  useEffect(() => {
    forceDelayedUpdate();
  }, [forceDelayedUpdate, saved]);

  return null;
}

export default ListingsLogic;
