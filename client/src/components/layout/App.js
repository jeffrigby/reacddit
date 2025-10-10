import { memo, StrictMode, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Navigation from './Navigation';
import Header from './Header';
import Help from './Help';
import Routes from './RedditRoutes';
import { redditGetBearer, redditFetchMe } from '@/redux/actions/reddit';
import '../../styles/layout.scss';
import { hotkeyStatus } from '@/common';

function App() {
  const [error, setError] = useState(false);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const redditBearer = useSelector((state) => state.redditBearer);
  const pinMenu = useSelector((state) => state.siteSettings.pinMenu);
  const subredditsFilter = useSelector((state) => state.subredditsFilter);
  const redditMe = useSelector((state) => state.redditMe);

  const hotkeys = (event) => {
    const pressedKey = event.key;

    if (hotkeyStatus()) {
      if (pressedKey === '?') {
        const modal = new bootstrap.Modal(document.getElementById('hotkeys'));
        modal.show();
      }
    }
  };

  const getToken = useCallback(async () => {
    const bearer = await dispatch(redditGetBearer());
    if (bearer !== null) {
      setToken(bearer);
      await dispatch(redditFetchMe());
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
  });

  // Get the token and user.
  useEffect(() => {
    getToken();
  }, [getToken]);

  useEffect(() => {
    const tokenQuery = token
      ? setInterval(() => dispatch(redditGetBearer()), 1000)
      : null;
    return () => {
      if (tokenQuery) {
        clearInterval(tokenQuery);
      }
    };
  }, [dispatch, token]);

  if (redditMe.status === 'error') {
    return (
      <div className="alert alert-danger m-2" role="alert">
        <p>
          Can&apos;t connect to the reddit API. This is possibly related to your
          browser blocking connections to &apos;oauth.reddit.com&apos;. Firefox
          blocks this by default. Please check your browser content blocking
          settings and try again.
        </p>
        <p>{redditMe.error}</p>
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

  // This is to handle an issue where the account or bearer isn't fetched correctly.
  if (loading || redditBearer.status === 'unloaded') {
    return null;
  }

  const menuStatus = pinMenu ? '' : 'hide-menu';

  return (
    <div className={menuStatus}>
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
