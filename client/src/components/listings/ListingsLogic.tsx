import { useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { useLocation } from 'react-router';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { uiStateUpdated, selectUiState } from '@/redux/slices/listingsSlice';
import {
  ListingsContextLastExpanded,
  useListingsContext,
} from '@/contexts/ListingsContext';
import {
  getCurrentListingState,
  unfocusIFrame,
  autoPlayVideos,
  nextEntry,
  nextEntryCollapsed,
  prevEntry,
  prevEntryCollapsed,
} from '@/components/posts/PostsFunctions';
import { hotkeyStatus } from '@/common';
import type { ListingsState } from '@/types/listings';

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
  // Get status from context (RTK Query)
  const { status } = useListingsContext();
  const settings = useAppSelector((state) => state.siteSettings);
  const locationKey = location.key;
  const listingsCurrentState = useAppSelector((state) =>
    selectUiState(state, location.key)
  ) as ExtendedListingsState;

  // Keep latest props in a ref.
  const prevState = useRef<ExtendedListingsState>(listingsCurrentState);
  const prevView = useRef(settings.view);
  const scrollResize = useRef(true);

  const contextValue = useContext(ListingsContextLastExpanded);
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
        dispatch(uiStateUpdated({ key, uiState: newState }));
      }
    },
    [listingsCurrentState, locationKey, dispatch]
  );

  const next = useCallback(() => {
    if (settings.view === 'expanded') {
      nextEntry(prevState.current.focused);
    } else {
      const nextId = nextEntryCollapsed(lastExpanded, setLastExpanded);
      if (nextId) {
        setLastExpandedRedux(nextId);
      }
    }
  }, [settings.view, lastExpanded, setLastExpanded, setLastExpandedRedux]);

  const prev = useCallback(() => {
    if (settings.view === 'expanded') {
      prevEntry(prevState.current.focused);
    } else {
      const prevId = prevEntryCollapsed(lastExpanded, setLastExpanded);
      if (prevId) {
        setLastExpandedRedux(prevId);
      }
    }
  }, [settings.view, lastExpanded, setLastExpanded, setLastExpandedRedux]);

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
      dispatch(uiStateUpdated({ key, uiState: newState }));
      prevState.current = newState;
    }

    unfocusIFrame();

    if (settings.autoplay) {
      autoPlayVideos();
    }

    scrollResize.current = true;
  }, [dispatch, lastExpanded, locationKey, settings.autoplay, settings.view]);

  const forceDelayedUpdate = useCallback(() => {
    monitorEntries();
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
    () =>
      throttle(monitorEntries, 150, {
        leading: true,
        trailing: true,
      }),
    [monitorEntries]
  );

  useEffect(() => {
    forceDelayedUpdate();

    const handleScroll = () => {
      throttledUpdate();
    };

    window.addEventListener('resize', throttledUpdate);
    document.addEventListener('scroll', handleScroll, true);

    return () => {
      window.removeEventListener('resize', throttledUpdate);
      document.removeEventListener('scroll', handleScroll, true);
      throttledUpdate.cancel?.();
    };
  }, [forceDelayedUpdate, throttledUpdate]);

  useEffect(() => {
    const handleUserInteraction = () => {
      unfocusIFrame();
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    forceDelayedUpdate();
  }, [forceDelayedUpdate, saved]);

  return null;
}

export default ListingsLogic;
