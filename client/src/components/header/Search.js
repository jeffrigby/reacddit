import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { push } from 'connected-react-router';
import { hotkeyStatus } from '../../common';

const queryString = require('query-string');

function Search() {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState('');

  const location = useLocation();
  const listingsFilter = useSelector((state) => state.listingsFilter);

  const searchInput = useRef();
  const searchInputParent = useRef();

  const dispatch = useDispatch();

  useEffect(() => {
    const qs = queryString.parse(location.search);
    const query = qs.q || '';
    setSearch(query);
  }, [location.search]);

  useEffect(() => {
    const handleSearchHotkey = (event) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case 'S':
            searchInput.current.focus();
            setSearch('');
            document.body.classList.remove('show-menu');
            event.preventDefault();
            break;
          default:
            break;
        }
      } else if (focused) {
        switch (pressedKey) {
          case 'Escape':
            searchInput.current.blur();
            setSearch('');
            event.preventDefault();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleSearchHotkey);
    return () => {
      document.removeEventListener('keydown', handleSearchHotkey);
    };
  });

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const focusSearch = () => {
    setFocused(true);
    searchInput.current.select();
    document.body.classList.add('search-active');
  };

  const blurSearch = () => {
    // delayed to allow button onclicks to trigger.
    setTimeout(() => {
      document.body.classList.remove('search-active');
      setFocused(false);
    }, 250);
  };

  const clearSearch = () => {
    setSearch('');
    searchInput.current.blur();
  };

  const getCurrentSearchSort = () => {
    const currentSearch = queryString.parse(location.search);
    const qs = {};
    if (currentSearch.sort !== undefined) {
      qs.sort = currentSearch.sort.match(/^(relevance|new|top)$/)
        ? currentSearch.sort
        : 'relevance';

      qs.t = currentSearch.t || null;
    } else {
      qs.sort = 'relevance';
    }
    return qs;
  };

  const getMainSearchURL = (q) => {
    const currentSearch = getCurrentSearchSort();
    const qs = { ...currentSearch, q };
    const qsString = queryString.stringify(qs);
    return `/search?${qsString}`;
  };

  const getTargetUrl = () => {
    const { listType, target, user, multi } = listingsFilter;
    if (
      (listType === 'r' || (listType === 's' && !multi)) &&
      target !== 'mine'
    ) {
      return `/r/${target}`;
    }

    if ((listType === 'm' || (listType === 's' && multi)) && user !== 'me') {
      return `/user/${target}/m/${target}`;
    }
    if ((listType === 'm' || (listType === 's' && multi)) && user === 'me') {
      return `/me/m/${target}`;
    }
    return '';
  };

  const searchTarget = () => {
    const q = searchInput.current.value;
    if (!q) {
      return;
    }
    const url = getMainSearchURL(q);
    const targetUrl = getTargetUrl();
    const finalUrl = `${targetUrl}${url}`;
    dispatch(push(finalUrl));
    searchInput.current.blur();
  };

  const searchEverywhere = () => {
    const q = searchInput.current.value;
    if (!q) {
      return;
    }
    const url = getMainSearchURL(q);
    dispatch(push(url));
    searchInput.current.blur();
  };

  const processSearch = (e) => {
    const q = e.target.value;
    if (!q) {
      return;
    }

    if (e.keyCode === 13) {
      if (!e.shiftKey) {
        searchTarget();
      } else {
        searchEverywhere();
      }
    }
  };

  const { target, listType, multi } = listingsFilter;
  let placeholder = 'search Reddit';
  let global = true;

  if (
    (listType === 'r' && target !== 'mine') ||
    (listType === 's' && target !== 'mine' && !multi)
  ) {
    placeholder = `search in /r/${target}`;
    global = false;
  } else if (
    listType === 'm' ||
    (listType === 's' && target !== 'mine' && multi)
  ) {
    placeholder = `search in /m/${target}`;
    global = false;
  }

  const showTargetSearch =
    listType === 'r' ||
    listType === 'm' ||
    (listType === 's' && target !== 'mine');
  const title = showTargetSearch
    ? 'Press shift-return to search all of reddit'
    : '';

  const searchClassName = focused ? 'search-focused m-0' : 'm-0';

  return (
    <div id="search" ref={searchInputParent} className={searchClassName}>
      <input
        type="text"
        className="form-control form-control-dark form-control-sm w-100 py-0"
        id="search-reddit"
        onFocus={focusSearch}
        onBlur={blurSearch}
        onKeyUp={processSearch}
        onChange={handleChange}
        placeholder={placeholder}
        title={title}
        value={search}
        ref={searchInput}
      />
      {(focused || search) && (
        <i
          className="far fa-times-circle form-control-clear"
          onClick={clearSearch}
          id="search-clear"
          aria-hidden
          role="button"
          aria-label="Clear Search Box"
        />
      )}
      {focused && !global && (
        <div className="searchToolTip small p-1 mt-1">
          {showTargetSearch && (
            <button
              type="button"
              className="btn btn-primary btn-sm me-1"
              onClick={searchTarget}
              disabled={!search}
            >
              Search in /r/{listingsFilter.target}{' '}
              <span className="no-touch">⏎</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={searchEverywhere}
            disabled={!search}
          >
            Search Everywhere <span className="no-touch">⇧⏎</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default Search;
