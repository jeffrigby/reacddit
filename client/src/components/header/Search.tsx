import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { isMobile } from 'react-device-detect';
import queryString from 'query-string';
import { Form, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { hotkeyStatus } from '@/common';

function Search() {
  const [focused, setFocused] = useState(false);
  const [search, setSearch] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [expandedOnMobile, setExpandedOnMobile] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const listingsFilter = useAppSelector(
    (state) => state.listings.currentFilter
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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767.98px)');
    const handleMediaChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsSmallScreen(e.matches);
      if (!e.matches) {
        setExpandedOnMobile(false);
      }
    };

    // Set initial value
    handleMediaChange(mediaQuery);

    // Listen for changes
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => {
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, []);

  useEffect(() => {
    // When expanded on mobile, focus the input to trigger search-active state
    if (expandedOnMobile && isSmallScreen && searchInput.current) {
      searchInput.current.focus();
    }
  }, [expandedOnMobile, isSmallScreen]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  const focusSearch = () => {
    setFocused(true);
    if (isSmallScreen) {
      setExpandedOnMobile(true);
    }
    if (searchInput.current) {
      searchInput.current.select();
    }
    document.body.classList.add('search-active');
  };

  const blurSearch = () => {
    document.body.classList.remove('search-active');
    setFocused(false);
    if (isSmallScreen) {
      setExpandedOnMobile(false);
    }
  };

  const handleSearchIconClick = () => {
    setExpandedOnMobile(true);
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
      return `/user/${user}/m/${target}`;
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
  const showFullSearch = !isSmallScreen || expandedOnMobile;

  return (
    <div className={searchClassName} id="search" ref={searchInputParent}>
      {!showFullSearch ? (
        <div className="header-button search-icon-button">
          <Button
            aria-label="Open search"
            size="sm"
            variant="secondary"
            onClick={handleSearchIconClick}
          >
            <FontAwesomeIcon icon={faSearch} />
          </Button>
        </div>
      ) : (
        <>
          <Form.Control
            className="w-100 py-0"
            id="search-reddit"
            placeholder={placeholder}
            ref={searchInput}
            size="sm"
            title={title}
            type="text"
            value={search}
            onBlur={blurSearch}
            onChange={handleChange}
            onFocus={focusSearch}
            onKeyUp={processSearch}
          />
          {(focused || search) && (
            <FontAwesomeIcon
              aria-hidden="true"
              aria-label="Clear Search Box"
              className="form-control-clear"
              icon={faTimesCircle}
              id="search-clear"
              role="button"
              onClick={clearSearch}
            />
          )}
          {focused && !global && (
            <div className="searchToolTip small p-1 mt-1">
              {showTargetSearch && (
                <Button
                  className="me-1"
                  disabled={!search}
                  size="sm"
                  variant="primary"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    searchTarget();
                  }}
                >
                  Search in /r/{listingsFilter.target} {!isMobile && <>⏎</>}
                </Button>
              )}
              <Button
                disabled={!search}
                size="sm"
                variant="primary"
                onMouseDown={(e) => {
                  e.preventDefault();
                  searchEverywhere();
                }}
              >
                Search Everywhere {!isMobile && <>⇧⏎</>}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Search;
