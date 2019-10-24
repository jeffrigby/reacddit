import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import isEqual from 'lodash/isEqual';
import throttle from 'lodash/throttle';
import { listingsState } from '../../redux/actions/listings';
import {
  listingState,
  listingStatus,
} from '../../redux/selectors/listingsSelector';
import {
  getCurrentListingState,
  unfocusIFrame,
  autoPlayVideos,
  nextEntry,
  prevEntry,
} from '../posts/PostsFunctions';
import { hotkeyStatus } from '../../common';

const ListingsLogic = () => {
  // Get Redux Props
  const status = useSelector(state => listingStatus(state));
  const settings = useSelector(state => state.siteSettings);
  const locationKey = useSelector(state => state.router.location.key);
  const listingsCurrentState = useSelector(state => listingState(state));

  // Keep latest props in a ref.
  const prevState = useRef(listingsCurrentState);
  const prevView = useRef(settings.view);
  const scrollResize = useRef(true);

  const dispatch = useDispatch();

  // Set some hotkeys
  const hotkeys = event => {
    if (hotkeyStatus() && (status === 'loaded' || status === 'loadedAll')) {
      const pressedKey = event.key;
      try {
        switch (pressedKey) {
          case 'j':
            nextEntry(listingsCurrentState.focused);
            break;
          case 'k':
            prevEntry(listingsCurrentState.focused);
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

    const newState = getCurrentListingState(prevState.current);
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
  }, [dispatch, locationKey, settings.autoplay]);

  const forceDelayedUpdate = useCallback(() => {
    monitorEntries();
    setTimeout(monitorEntries, 100);
    setTimeout(monitorEntries, 500);
    setTimeout(monitorEntries, 1000);
    setTimeout(monitorEntries, 2000);
  }, [monitorEntries]);

  useEffect(() => {
    if (prevView.current === settings.view) return;
    forceDelayedUpdate();
    prevView.current = settings.view;
  }, [forceDelayedUpdate, settings.view]);

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

  return <></>;
};

ListingsLogic.propTypes = {};
ListingsLogic.defaultProps = {};

export default ListingsLogic;
