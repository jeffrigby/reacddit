import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { isMobile } from 'react-device-detect';
import queryString from 'query-string';
import type { ListingsFilter } from '@/types/listings';
import { useAppSelector } from '@/redux/hooks';
import { hotkeyStatus } from '@/common';

function Search() {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState('');

  const location = useLocation();
  const navigate = useNavigate();

  const listingsFilter = useAppSelector<ListingsFilter>(
    (state) => state.listingsFilter
  );

  const searchInput = useRef<HTMLInputElement>(null);
  const searchInputParent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const qs = queryString.parse(location.search);
    const query = qs.q ?? '';
    setSearch(query as string);
  }, [location.search]);

  useEffect(() => {
    const handleSearchHotkey = (event: KeyboardEvent) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case 'S':
            if (searchInput.current) {
              searchInput.current.focus();
              setSearch('');
              document.body.classList.remove('show-menu');
              event.preventDefault();
            }
            break;
          default:
            break;
        }
      } else if (focused) {
        switch (pressedKey) {
          case 'Escape':
            if (searchInput.current) {
              searchInput.current.blur();
              setSearch('');
              event.preventDefault();
            }
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
  }, [focused]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const focusSearch = () => {
    setFocused(true);
    if (searchInput.current) {
      searchInput.current.select();
    }
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
    if (searchInput.current) {
      searchInput.current.blur();
    }
  };

  const getCurrentSearchSort = (): { sort: string; t: string | null } => {
    const currentSearch = queryString.parse(location.search);
    const qs: { sort: string; t: string | null } = {
      sort: 'relevance',
      t: null,
    };

    if (currentSearch.sort !== undefined) {
      const sort = currentSearch.sort as string;
      qs.sort = sort.match(/^(relevance|new|top)$/) ? sort : 'relevance';
      qs.t = (currentSearch.t as string) || null;
    }

    return qs;
  };

  const getMainSearchURL = (q: string) => {
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
    if (!searchInput.current?.value) {
      return;
    }

    const q = searchInput.current.value;
    const url = getMainSearchURL(q);
    const targetUrl = getTargetUrl();
    const finalUrl = `${targetUrl}${url}`;
    navigate(finalUrl);

    if (searchInput.current) {
      searchInput.current.blur();
    }
  };

  const searchEverywhere = () => {
    if (!searchInput.current?.value) {
      return;
    }

    const q = searchInput.current.value;
    const url = getMainSearchURL(q);
    navigate(url);

    if (searchInput.current) {
      searchInput.current.blur();
    }
  };

  const processSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const q = e.currentTarget.value;
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
    <div className={searchClassName} id="search" ref={searchInputParent}>
      <input
        className="form-control form-control-sm w-100 py-0"
        id="search-reddit"
        placeholder={placeholder}
        ref={searchInput}
        title={title}
        type="text"
        value={search}
        onBlur={blurSearch}
        onChange={handleChange}
        onFocus={focusSearch}
        onKeyUp={processSearch}
      />
      {(focused || search) && (
        <i
          aria-hidden="true"
          aria-label="Clear Search Box"
          className="far fa-times-circle form-control-clear"
          id="search-clear"
          role="button"
          onClick={clearSearch}
        />
      )}
      {focused && !global && (
        <div className="searchToolTip small p-1 mt-1">
          {showTargetSearch && (
            <button
              className="btn btn-primary btn-sm me-1"
              disabled={!search}
              type="button"
              onClick={searchTarget}
            >
              Search in /r/{listingsFilter.target} {!isMobile && <>⏎</>}
            </button>
          )}
          <button
            className="btn btn-primary btn-sm"
            disabled={!search}
            type="button"
            onClick={searchEverywhere}
          >
            Search Everywhere {!isMobile && <>⇧⏎</>}
          </button>
        </div>
      )}
    </div>
  );
}

export default Search;
