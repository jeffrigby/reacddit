import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import queryString from 'query-string';
import _trim from 'lodash/trim';
import _trimEnd from 'lodash/trimEnd';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { getDiffClassName } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import SubFavorite from './SubFavorite';

const getLastUpdated = (lastUpdated, subreddit) => {
  if (subreddit.name === undefined) return 0;

  return lastUpdated[subreddit.name] ? lastUpdated[subreddit.name].lastPost : 0;
};

function NavigationItem({ item, trigger }) {
  const sort = useSelector((state) => state.listingsFilter.sort);
  const me = useSelector((state) => state.redditMe.me);
  const lastUpdated = useSelector((state) =>
    getLastUpdated(state.lastUpdated, item)
  );
  const location = useLocation();

  const query = queryString.parse(location.search);
  const { t } = query;
  let currentSort = sort || '';
  switch (currentSort) {
    case 'top':
    case 'controversial':
      currentSort += t ? `?t=${t}` : '';
      break;
    case 'relevance':
    case 'best':
    case 'comments':
      currentSort = '';
      break;
    default:
      break;
  }

  const href =
    item.subreddit_type === 'user'
      ? `/${_trim(item.url, '/')}/posts/${_trim(currentSort, '/')}`
      : `/${_trim(item.url, '/')}/${_trim(currentSort, '/')}`;
  const classNameStr = getDiffClassName(lastUpdated, trigger);
  const subLabel = classNameStr.indexOf('sub-new') !== -1 ? 'New' : null;

  let { title } = item;
  if (lastUpdated !== 0) {
    const timeago = formatDistanceToNow(lastUpdated * 1000);
    title += ` - updated ${timeago} ago`;
  }

  return (
    <li className="nav-item d-flex align-items-center">
      <div className="d-flex w-100">
        {me.name && (
          <div>
            {item.user_has_favorited !== undefined && (
              <SubFavorite
                isFavorite={item.user_has_favorited}
                srName={item.display_name}
              />
            )}
          </div>
        )}
        <NavigationGenericNavItem
          to={_trimEnd(href, '/')}
          text={item.display_name}
          id={item.id}
          classes={classNameStr}
          title={title}
          badge={subLabel}
          noLi
        />
      </div>
    </li>
  );
}

NavigationItem.propTypes = {
  item: PropTypes.object.isRequired,
  trigger: PropTypes.bool.isRequired,
};

export default NavigationItem;
