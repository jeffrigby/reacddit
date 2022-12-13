import { useEffect } from 'react';
import queryString from 'query-string';
import _isEmpty from 'lodash/isEmpty';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router';
import { hotkeyStatus } from '../../common';

const catsSearch = {
  R: 'relevance',
  T: 'top',
  H: 'hot',
  N: 'new',
  C: 'comments',
};

const catsFront = {
  B: 'best',
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsReddits = {
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsMultis = {
  H: 'hot',
  T: 'top',
  N: 'new',
  C: 'controversial',
  R: 'rising',
};

const catsUsers = {
  H: 'hot',
  T: 'top',
  N: 'new',
};

const catsComments = {
  B: 'best',
  T: 'top',
  N: 'new',
  C: 'controversial',
  O: 'old',
  Q: 'qa',
};

const timeCats = {
  hour: 'past hour',
  day: 'past 24 hour',
  week: 'past week',
  month: 'past month',
  year: 'past year',
  all: 'all time',
};

const iconClasses = {
  relevance: 'fas fa-bullseye fa-fw',
  hot: 'fas fa-fire-alt fa-fw',
  best: 'fas fa-award fa-fw',
  rising: 'fas fa-chart-line fa-fw',
  new: 'fas fa-clock fa-fw',
  controversial: 'fas fa-bolt fa-fw',
  top: 'fas fa-sort-amount-up fa-fw',
  comments: 'fas fa-comment fa-fw',
  qa: 'fas fa-question-circle fa-fw',
  old: 'fas fa-history fa-fw',
};

function Sort() {
  const me = useSelector((state) => state.redditMe.me);
  const listingsFilter = useSelector((state) => state.listingsFilter);
  const location = useLocation();
  const navigate = useNavigate();
  const { search } = location;

  const getIcon = (sort) => <i className={iconClasses[sort]} />;

  const genLink = (sort, t) => {
    const { listType, target, userType } = listingsFilter;
    const qs = queryString.parse(search);
    // add the timeline if requested.
    if (t) {
      qs.t = t;
    }

    const to = {};
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
      case 'comments':
      case 'u':
        qs.sort = sort;
        break;
      default:
        break;
    }

    if (!_isEmpty(qs)) {
      if (!sort.match(/^(top|controversial|relevance)$/)) {
        delete qs.t;
      }
      const searchRendered = queryString.stringify(qs);
      to.search = `?${searchRendered}`;
    }

    to.state = { showBack: true };

    return to;
  };

  const handleSortHotkey = (event) => {
    const { target, listType } = listingsFilter;
    if (hotkeyStatus() && target !== 'friends') {
      const pressedKey = event.key;
      switch (pressedKey) {
        case 'H': {
          navigate(genLink('hot'));
          // dispatch(push(genLink('hot')));
          break;
        }
        case 'B': {
          navigate(genLink('best'));
          break;
        }
        case 'N': {
          navigate(genLink('new'));
          break;
        }
        case 'C': {
          navigate(genLink('controversial'));
          break;
        }
        case 'R': {
          navigate(genLink('rising'));
          break;
        }
        case 'T': {
          navigate(genLink('top'));
          break;
        }
        case 'Q': {
          if (listType === 'comments') {
            navigate(genLink('qa'));
          }
          break;
        }
        case 'O': {
          if (listType === 'comments') {
            navigate(genLink('old'));
          }
          break;
        }
        default:
          break;
      }
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleSortHotkey);
    return () => {
      document.removeEventListener('keydown', handleSortHotkey);
    };
  });

  const renderTimeSubLinks = (sort) => {
    const { listType, target } = listingsFilter;

    const qs = queryString.parse(search);

    if (
      !sort.match(/^(top|controversial|relevance)$/) ||
      target === 'friends' ||
      listType === 'u' ||
      listType === 'comments'
    ) {
      return null;
    }

    const links = [];
    Object.entries(timeCats).forEach(([t, linkString]) => {
      const url = genLink(sort, t);
      const linkKey = `time${sort}${t}`;
      const currentSortQs = qs.t || 'day';
      const active = () => listingsFilter.sort === sort && currentSortQs === t;

      const sortActive = active() ? 'sort-active' : '';

      links.push(
        <NavLink
          to={url}
          key={linkKey}
          className={`dropdown-item ${sortActive}`}
        >
          <span className="sort-title ps-3 small">{linkString}</span>
        </NavLink>
      );
    });

    return links;
  };

  const isActive = (listType, sort, sortName) => {
    const qs = queryString.parse(search);

    let active = false;

    switch (listType) {
      case 'r':
      case 'm':
        active = sort === sortName;
        break;
      case 'u':
      case 's':
      case 'comments':
        active = qs.sort === sortName;
        break;
      default:
        break;
    }

    return active;
  };

  const renderLinks = () => {
    const { listType, target, sort } = listingsFilter;
    let links2render = {};

    if (listType === 'r' && target === 'mine') {
      links2render = { ...catsFront };
    } else if (listType === 'r') {
      links2render = { ...catsReddits };
    } else if (listType === 's') {
      links2render = { ...catsSearch };
    } else if (listType === 'm') {
      links2render = { ...catsMultis };
    } else if (listType === 'comments') {
      links2render = { ...catsComments };
    } else if (listType === 'u') {
      links2render = { ...catsUsers };
    }

    const links = [];

    Object.keys(links2render).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(links2render, key)) {
        const sortName = links2render[key];
        const subLinks = renderTimeSubLinks(sortName);

        const subLinksRendered = !_isEmpty(subLinks) ? (
          <div className="subsortlinks">{subLinks}</div>
        ) : null;

        const active = isActive(listType, sort, sortName);

        links.push(
          <div key={sortName}>
            <NavLink
              to={genLink(sortName)}
              className={`dropdown-item d-flex small ${
                active ? 'sort-active' : ''
              }`}
            >
              <div className="me-auto pe-2 sort-title">
                {getIcon(sortName)} {sortName}
              </div>{' '}
              <span className="menu-shortcut">&#x21E7;{key}</span>
            </NavLink>
            {subLinksRendered}
          </div>
        );
      }
    });

    return links;
  };

  const { listType, sort, target } = listingsFilter;
  if (target === 'friends' || listType === 'duplicates') {
    return false;
  }
  let currentSort;
  switch (listType) {
    case 'r':
    case 'm':
      currentSort = sort || 'hot';
      break;
    case 's': {
      const searchParsed = queryString.parse(search);
      currentSort = searchParsed.sort || 'relevance';
      break;
    }
    case 'comments':
      currentSort = sort || 'best';
      break;
    case 'u':
      currentSort = sort || 'new';
      break;
    default:
      currentSort = 'hot';
  }

  const icon = getIcon(currentSort);
  const links = renderLinks();

  return (
    <div className="btn-group sort-menu header-button">
      <button
        type="button"
        className="btn btn-secondary btn-sm form-control-sm dropdown-toggle sort-button"
        data-bs-toggle="dropdown"
        aria-haspopup="true"
        aria-expanded="false"
        aria-label="Sort"
      >
        {icon} {currentSort}
      </button>
      <div className="dropdown-menu dropdown-menu-end">{links}</div>
    </div>
  );
}

export default Sort;
