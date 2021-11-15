import { useEffect, useRef, useCallback, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import PropTypes from 'prop-types';
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

function ListingsLogic({ saved }) {
  // Get Redux Props
  const status = useSelector((state) => listingStatus(state));
  const settings = useSelector((state) => state.siteSettings);
  const locationKey = useSelector((state) => state.router.location.key);
  const listingsCurrentState = useSelector((state) => listingState(state));

  // Keep latest props in a ref.
  const prevState = useRef(listingsCurrentState);
  const prevView = useRef(settings.view);
  const scrollResize = useRef(true);

  const [lastExpanded, setLastExpanded] = useContext(
    ListingsContextLastExpanded
  );

  const dispatch = useDispatch();

  const setLastExpandedRedux = (expandedId) => {
    if (expandedId) {
      const newState = { ...listingsCurrentState };
      newState.lastExpanded = expandedId;
      const key = locationKey || 'front';
      dispatch(listingsState(key, newState));
    }
  };

  const next = () => {
    if (settings.view === 'expanded') {
      nextEntry(listingsCurrentState.focused);
    } else {
      setLastExpandedRedux(nextEntryCollapsed(lastExpanded, setLastExpanded));
    }
  };

  const prev = () => {
    if (settings.view === 'expanded') {
      prevEntry(listingsCurrentState.focused);
    } else {
      setLastExpandedRedux(prevEntryCollapsed(lastExpanded, setLastExpanded));
    }
  };

  // Set some hotkeys
  const hotkeys = (event) => {
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
        // console.log(e);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  });

  const monitorEntries = useCallback(() => {
    if (!scrollResize.current) return;

    const postsCollection = document.getElementsByClassName('entry');
    if (postsCollection.length === 0) return;
    scrollResize.current = false;

    const newState = getCurrentListingState(
      prevState.current,
      settings.view,
      lastExpanded
    );

    const key = locationKey || 'front';

    const compareState = { ...prevState.current };
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

  // This seems like a dumb way to do this.
  const forceDelayedUpdate = useCallback(() => {
    monitorEntries();
    setTimeout(monitorEntries, 100);
    setTimeout(monitorEntries, 500);
    setTimeout(monitorEntries, 1000);
    setTimeout(monitorEntries, 2000);
  }, [monitorEntries]);

  const { view } = settings;

  useEffect(() => {
    if (prevView.current === view) return;
    forceDelayedUpdate();
    prevView.current = view;
  }, [forceDelayedUpdate, view]);

  // Monitor Entries
  useEffect(() => {
    forceDelayedUpdate();
    const throttledUpdate = throttle(monitorEntries, 500);
    window.addEventListener('resize', throttledUpdate, false);
    document.addEventListener('scroll', throttledUpdate, false);

    return () => {
      window.removeEventListener('resize', throttledUpdate, false);
      document.removeEventListener('scroll', throttledUpdate, false);
    };
  }, [forceDelayedUpdate, monitorEntries]);

  useEffect(() => {
    // Check if iframe is focused. If it is, unfocus it so hotkeys work.
    const monitorIframeFocus = setInterval(unfocusIFrame, 1000);
    return () => {
      clearInterval(monitorIframeFocus);
    };
  });

  // Effect to trigger monitor if the saved arg changes.
  // This is to make sure newly fetched entries render.
  useEffect(() => {
    forceDelayedUpdate();
  }, [forceDelayedUpdate, saved]);

  return null;
}

ListingsLogic.propTypes = {
  saved: PropTypes.number,
};
ListingsLogic.defaultProps = {
  saved: 0,
};

export default ListingsLogic;
