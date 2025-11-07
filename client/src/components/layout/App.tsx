import { memo, StrictMode, useState, useEffect, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/configureStore';
import { fetchBearer } from '@/redux/slices/redditBearerSlice';
import { fetchMe } from '@/redux/slices/redditMeSlice';
import { siteSettingsChanged } from '@/redux/slices/siteSettingsSlice';
import { hotkeyStatus, scrollToPosition } from '@/common';
import { useModals } from '@/contexts/ModalContext';
import { useScrollClickPrevention } from '@/hooks/useScrollClickPrevention';
import Navigation from './Navigation';
import Header from './Header';
import Help from './Help';
import Routes from './RedditRoutes';
import '../../styles/layout.scss';

function App() {
  const [error, setError] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const redditMe = useAppSelector((state) => state.redditMe);
  const pinMenu = useAppSelector((state) => state.siteSettings.pinMenu);
  const subredditsFilter = useAppSelector((state) => state.subredditFilter);
  const { setShowHotkeys } = useModals();
  const isScrolling = useScrollClickPrevention();

  const hotkeys = useCallback(
    (event: KeyboardEvent) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case '?':
            setShowHotkeys(true);
            break;
          case '>': {
            const currentStream = store.getState().siteSettings.stream;
            scrollToPosition(0, 0);
            dispatch(siteSettingsChanged({ stream: !currentStream }));
            break;
          }
          case 'Î': {
            const currentDebug = store.getState().siteSettings.debug ?? false;
            dispatch(siteSettingsChanged({ debug: !currentDebug }));
            break;
          }
          default:
            break;
        }
      }
    },
    [setShowHotkeys, dispatch]
  );

  const getToken = useCallback(async () => {
    const bearerResult = await dispatch(fetchBearer());
    if (fetchBearer.fulfilled.match(bearerResult)) {
      setToken(bearerResult.payload.bearer);
      // Fetch user profile after bearer token is ready
      await dispatch(fetchMe());
      setLoading(false);
    } else {
      setError(true);
      setMessage(
        'Fatal error getting Reddit token. This is bad. Please try again in a few.'
      );
    }
  }, [dispatch]);

  // Set Hot Keys
  useEffect(() => {
    document.addEventListener('keydown', hotkeys);
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, [hotkeys]);

  useEffect(() => {
    getToken();
  }, [getToken]);

  useEffect(() => {
    const tokenQuery = token
      ? setInterval(() => dispatch(fetchBearer()), 1000)
      : null;
    return () => {
      if (tokenQuery) {
        clearInterval(tokenQuery);
      }
    };
  }, [dispatch, token]);

  if (redditMe.status === 'failed') {
    return (
      <div className="alert alert-danger m-2" role="alert">
        <p>
          Can&apos;t connect to the reddit API. This is possibly related to your
          browser blocking connections to &apos;oauth.reddit.com&apos;. Firefox
          blocks this by default. Please check your browser content blocking
          settings and try again.
        </p>
        <p>{redditMe.error ? String(redditMe.error) : 'Unknown error'}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-2" role="alert">
        {message}
      </div>
    );
  }

  if (loading || redditBearer.status === 'idle') {
    return null;
  }

  const menuStatus = pinMenu ? '' : 'hide-menu';
  const scrollingClass = isScrolling ? 'scrolling' : '';
  const containerClasses = [menuStatus, scrollingClass]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses}>
      <StrictMode>
        <header className="navbar navbar-dark fixed-top bg-dark flex-nowrap p-0 shadow">
          <Header />
        </header>
        <aside className="sidebar pt-2" id="navigation">
          <div className="h-100 d-flex px-3" id="aside-content">
            <Navigation
              redditBearer={redditBearer}
              subredditsFilter={subredditsFilter}
            />
          </div>
        </aside>

        <main id="main">
          <Routes />
        </main>

        <Help />
        <div id="menu-overlay" />
      </StrictMode>
    </div>
  );
}

export default memo(App);
