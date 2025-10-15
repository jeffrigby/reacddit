import queryString from 'query-string';
import _trim from 'lodash/trim';
import _trimEnd from 'lodash/trimEnd';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import type { SubredditData } from '@/types/redditApi';
import { useAppSelector } from '@/redux/hooks';
import { selectLastUpdatedTracking } from '@/redux/slices/subredditsSlice';
import { getDiffClassName, buildSortPath } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import SubFavorite from './SubFavorite';

interface NavigationItemProps {
  item: SubredditData;
  trigger: boolean;
}

function NavigationItem({ item, trigger }: NavigationItemProps) {
  const sort = useAppSelector((state) => state.listings.currentFilter.sort);
  const me = useAppSelector((state) => state.redditMe?.me);
  const lastUpdatedTracking = useAppSelector(selectLastUpdatedTracking);
  const location = useLocation();

  // Get last updated timestamp for this subreddit
  const lastUpdated = item.name
    ? (lastUpdatedTracking[item.name]?.lastPost ?? 0)
    : 0;

  const query = queryString.parse(location.search);
  const { t } = query;
  // Convert null to undefined and filter out null values from arrays
  const timeFilter = Array.isArray(t)
    ? t.filter((item): item is string => item !== null)
    : (t ?? undefined);
  const sortPath = buildSortPath(sort, timeFilter);

  const href =
    item.subreddit_type === 'user'
      ? `/${_trim(item.url, '/')}/posts/${_trim(sortPath, '/')}`
      : `/${_trim(item.url, '/')}/${_trim(sortPath, '/')}`;
  const classNameStr = getDiffClassName(lastUpdated, trigger);
  const subLabel = classNameStr.includes('sub-new') ? 'New' : undefined;

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
