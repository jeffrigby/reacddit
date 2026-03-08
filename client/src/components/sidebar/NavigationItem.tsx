import queryString from 'query-string';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import type { SubredditData } from '@/types/redditApi';
import type { RootState } from '@/types/redux';
import { trimSlashes } from '@/common';
import { useAppSelector } from '@/redux/hooks';
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
  const location = useLocation();

  // Select only this item's lastPost value — prevents re-renders when other
  // subreddits update (strict === equality means only this item's change
  // triggers a re-render)
  const lastUpdated = useAppSelector(
    (state: RootState) =>
      state.subredditPolling.lastUpdatedTracking[item.name]?.lastPost ?? 0
  );

  const query = queryString.parse(location.search);
  const { t } = query;
  const timeFilter = Array.isArray(t)
    ? t.filter((item): item is string => item !== null)
    : (t ?? undefined);
  const sortPath = buildSortPath(sort, timeFilter);

  const href =
    item.subreddit_type === 'user'
      ? `/${trimSlashes(item.url.trim())}/posts/${trimSlashes(sortPath.trim())}`
      : `/${trimSlashes(item.url.trim())}/${trimSlashes(sortPath.trim())}`;
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
          to={href.replace(/\/$/, '')}
        />
      </div>
    </li>
  );
}

export default NavigationItem;
