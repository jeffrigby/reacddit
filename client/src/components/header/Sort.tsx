import { useCallback, useEffect } from 'react';
import type { To } from 'react-router';
import { NavLink, useNavigate, useLocation } from 'react-router';
import type { JSX } from 'react/jsx-runtime';
import { Dropdown } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBullseye,
  faFireAlt,
  faAward,
  faChartLine,
  faClock,
  faBolt,
  faSortAmountUp,
  faComment,
  faQuestionCircle,
  faHistory,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useAppSelector } from '@/redux/hooks';
import { useOverlayRouting } from '@/contexts';
import { hotkeyStatus, isEmpty } from '@/common';

interface SortCategories {
  [key: string]: string;
}

interface SortIcons {
  [key: string]: IconDefinition;
}

const catsSearch: SortCategories = {
  R: 'relevance',
  T: 'top',
  H: 'hot',
  N: 'new',
  C: 'comments',
};

const catsBase: SortCategories = {
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsFront: SortCategories = {
  B: 'best',
  ...catsBase,
};

const catsUsers: SortCategories = {
  H: 'hot',
  T: 'top',
  N: 'new',
};

const catsComments: SortCategories = {
  B: 'best',
  T: 'top',
  N: 'new',
  C: 'controversial',
  O: 'old',
  Q: 'qa',
};

// Shift+key hotkey -> sort name. qa/old only apply on comments pages.
const hotkeySorts: SortCategories = {
  H: 'hot',
  B: 'best',
  N: 'new',
  C: 'controversial',
  R: 'rising',
  T: 'top',
  Q: 'qa',
  O: 'old',
};

const timeCats: SortCategories = {
  hour: 'past hour',
  day: 'past 24 hour',
  week: 'past week',
  month: 'past month',
  year: 'past year',
  all: 'all time',
};

const sortIcons: SortIcons = {
  relevance: faBullseye,
  hot: faFireAlt,
  best: faAward,
  rising: faChartLine,
  new: faClock,
  controversial: faBolt,
  top: faSortAmountUp,
  comments: faComment,
  qa: faQuestionCircle,
  old: faHistory,
};

function Sort() {
  const me = useAppSelector((state) => state.redditMe?.me);
  const listingsFilter = useAppSelector(
    (state) => state.listings.currentFilter
  );
  const location = useLocation();
  const navigate = useNavigate();
  const { overlayOpen } = useOverlayRouting();
  const { search } = location;

  // Sort navigations must keep an OPEN overlay alive (the state carries its
  // backgroundLocation), but must NOT forward stale state on a standalone
  // page — history.state survives reloads and would resurrect the overlay.
  const sortNavState: unknown = overlayOpen ? location.state : undefined;

  const getIcon = (sort: string) => (
    <FontAwesomeIcon fixedWidth icon={sortIcons[sort]} />
  );

  const genLink = useCallback(
    (sort: string, t?: string): To => {
      const { listType, target, userType } = listingsFilter;
      const qs = new URLSearchParams(search);
      if (t) {
        qs.set('t', t);
      }

      const to: { pathname: string; search: string } = {
        pathname: '',
        search: '',
      };

      switch (listType) {
        case 'r':
          to.pathname = target === 'mine' ? `/${sort}` : `/r/${target}/${sort}`;
          break;
        case 'm':
          to.pathname = !me
            ? `/user/${target}/m${userType}/${sort}`
            : `/me/m/${target}/${sort}`;
          break;
        case 's':
          qs.set('sort', sort);
          to.pathname =
            target && target !== 'mine' ? `/r/${target}/search` : '/search';
          break;
        case 'comments':
        case 'u':
          // Sort travels via ?sort= on the SAME page. The pathname must be
          // absolute: the header renders outside any route context, so a
          // relative To resolves against the root ('/'), not the current URL.
          qs.set('sort', sort);
          to.pathname = location.pathname;
          break;
        default:
          break;
      }

      if (qs.size > 0) {
        if (!sort.match(/^(top|controversial|relevance)$/)) {
          qs.delete('t');
        }
        to.search = `?${qs.toString()}`;
      }

      return to;
    },
    [listingsFilter, me, search, location.pathname]
  );

  const handleSortHotkey = useCallback(
    (event: KeyboardEvent) => {
      const { target, listType } = listingsFilter;
      if (!hotkeyStatus() || target === 'friends') {
        return;
      }
      const sort = hotkeySorts[event.key];
      if (
        !sort ||
        ((sort === 'qa' || sort === 'old') && listType !== 'comments')
      ) {
        return;
      }
      navigate(genLink(sort), { state: sortNavState });
    },
    [genLink, listingsFilter, navigate, sortNavState]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleSortHotkey);
    return () => {
      document.removeEventListener('keydown', handleSortHotkey);
    };
  }, [handleSortHotkey]);

  const renderTimeSubLinks = (sort: string) => {
    const { listType, target } = listingsFilter;

    const qs = new URLSearchParams(search);

    if (
      !sort.match(/^(top|controversial|relevance)$/) ||
      target === 'friends' ||
      listType === 'u' ||
      listType === 'comments'
    ) {
      return null;
    }

    const links: JSX.Element[] = [];
    Object.entries(timeCats).forEach(([t, linkString]) => {
      const url = genLink(sort, t);
      const linkKey = `time${sort}${t}`;
      const currentSortQs = qs.get('t') ?? 'day';
      const active = () => listingsFilter.sort === sort && currentSortQs === t;

      const sortActive = active() ? 'sort-active' : '';

      links.push(
        <Dropdown.Item
          as={NavLink}
          className={sortActive}
          key={linkKey}
          state={sortNavState}
          to={url}
        >
          <span className="sort-title ps-3 small">{linkString}</span>
        </Dropdown.Item>
      );
    });

    return links;
  };

  const isActive = (
    listType: string,
    sort: string | undefined,
    sortName: string
  ) => {
    const qs = new URLSearchParams(search);

    let active = false;

    switch (listType) {
      case 'r':
      case 'm':
        active = sort === sortName;
        break;
      case 'u':
      case 's':
      case 'comments':
        active = qs.get('sort') === sortName;
        break;
      default:
        break;
    }

    return active;
  };

  const renderLinks = () => {
    const { listType, target, sort } = listingsFilter;
    let links2render: SortCategories = {};

    if (listType === 'r' && target === 'mine') {
      links2render = { ...catsFront };
    } else if (listType === 'r') {
      links2render = { ...catsBase };
    } else if (listType === 's') {
      links2render = { ...catsSearch };
    } else if (listType === 'm') {
      links2render = { ...catsBase };
    } else if (listType === 'comments') {
      links2render = { ...catsComments };
    } else if (listType === 'u') {
      links2render = { ...catsUsers };
    }

    const links: JSX.Element[] = [];

    Object.keys(links2render).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(links2render, key)) {
        const sortName = links2render[key];
        const subLinks = renderTimeSubLinks(sortName);

        const subLinksRendered = !isEmpty(subLinks) ? (
          <div className="subsortlinks">{subLinks}</div>
        ) : null;

        const active = isActive(listType, sort, sortName);

        links.push(
          <div key={sortName}>
            <Dropdown.Item
              as={NavLink}
              className={`d-flex small ${active ? 'sort-active' : ''}`}
              state={sortNavState}
              to={genLink(sortName)}
            >
              <div className="me-auto pe-2 sort-title">
                {getIcon(sortName)} {sortName}
              </div>{' '}
              <span className="menu-shortcut">&#x21E7;{key}</span>
            </Dropdown.Item>
            {subLinksRendered}
          </div>
        );
      }
    });

    return links;
  };

  const { listType, sort, target } = listingsFilter;
  if (target === 'friends' || listType === 'duplicates') {
    return null;
  }

  let currentSort: string;
  switch (listType) {
    case 'r':
    case 'm':
      currentSort = sort ?? 'hot';
      break;
    case 's':
      currentSort = new URLSearchParams(search).get('sort') ?? 'relevance';
      break;
    case 'comments':
      currentSort = sort ?? 'best';
      break;
    case 'u':
      currentSort = sort ?? 'new';
      break;
    default:
      currentSort = 'hot';
  }

  const icon = getIcon(currentSort);
  const links = renderLinks();

  return (
    <Dropdown className="sort-menu header-button">
      <Dropdown.Toggle
        aria-label="Sort"
        className="form-control-sm sort-button"
        id="dropdown-sort"
        size="sm"
        variant="secondary"
      >
        {icon} {currentSort}
      </Dropdown.Toggle>
      <Dropdown.Menu align="end">{links}</Dropdown.Menu>
    </Dropdown>
  );
}

export default Sort;
