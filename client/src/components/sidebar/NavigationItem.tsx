import queryString from 'query-string';
import _trim from 'lodash/trim';
import _trimEnd from 'lodash/trimEnd';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import type { SubredditData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { getDiffClassName, buildSortPath } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import SubFavorite from './SubFavorite';

interface NavigationItemProps {
  item: SubredditData;
  trigger: boolean;
}

interface LastUpdatedState {
  [key: string]: {
    lastPost: number;
  };
}

function getLastUpdated(
  lastUpdated: LastUpdatedState,
  subreddit: SubredditData
): number {
  if (subreddit.name === undefined) {
    return 0;
  }

  return lastUpdated[subreddit.name] ? lastUpdated[subreddit.name].lastPost : 0;
}

function NavigationItem({ item, trigger }: NavigationItemProps) {
  const sort = useAppSelector((state) => state.listingsFilter.sort);
  const me = useAppSelector((state) => state.redditMe.me);
  const lastUpdated = useAppSelector((state) =>
    getLastUpdated(state.lastUpdated, item)
  );
  const location = useLocation();

  const query = queryString.parse(location.search);
  const { t } = query;
  const sortPath = buildSortPath(sort, t);

  const href =
    item.subreddit_type === 'user'
      ? `/${_trim(item.url, '/')}/posts/${_trim(sortPath, '/')}`
      : `/${_trim(item.url, '/')}/${_trim(sortPath, '/')}`;
  const classNameStr = getDiffClassName(lastUpdated, trigger);
  const subLabel = classNameStr.includes('sub-new') ? 'New' : null;

  let { title } = item;
  if (lastUpdated !== 0) {
    const timeago = formatDistanceToNow(lastUpdated * 1000);
    title += ` - updated ${timeago} ago`;
  }

  return (
    <li className="nav-item d-flex align-items-center">
      <div className="d-flex w-100">
        {me?.name && (
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
          noLi
          badge={subLabel}
          classes={classNameStr}
          id={item.id}
          text={item.display_name}
          title={title}
          to={_trimEnd(href, '/')}
        />
      </div>
    </li>
  );
}

export default NavigationItem;
