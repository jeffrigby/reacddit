import { memo, type ReactElement } from 'react';
import { formatDistanceToNow } from 'date-fns';
import type { SubredditData } from '@/types/redditApi';
import type { RootState } from '@/types/redux';
import { useAppSelector } from '@/redux/hooks';
import { getDiffClassName } from './navHelpers';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import SubFavorite from './SubFavorite';

interface NavigationItemProps {
  item: SubredditData;
  /** Destination path, built by the list that also publishes it to the registry */
  href: string;
  trigger: boolean;
}

function NavigationItem({
  item,
  href,
  trigger,
}: NavigationItemProps): ReactElement {
  const me = useAppSelector((state) => state.redditMe?.me);

  // Select only this item's lastPost value — the returned number is compared
  // via strict === equality, so re-renders only occur when this specific
  // subreddit's timestamp changes (not when other subreddits update)
  const lastUpdated = useAppSelector(
    (state: RootState) =>
      state.subredditPolling.lastUpdatedTracking[item.name]?.lastPost ?? 0
  );

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
          to={href}
        />
      </div>
    </li>
  );
}

export default memo(NavigationItem);
