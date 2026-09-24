import type { ReactElement } from 'react';
import type { EntityState } from '@reduxjs/toolkit';
import type { SubredditData } from '@/types/redditApi';
import { buildSubredditHref } from './navHelpers';
import NavigationItem from './NavigationItem';
import { useSubscribedEntities } from './useFilteredSubreddits';
import { useSubredditSortPath } from './useSubredditSortPath';

interface SubredditItem {
  name: string;
}

interface MultiRedditsSubsProps {
  multiRedditSubs: SubredditItem[];
}

/**
 * Rows for a custom feed's members. A member the account also subscribes to
 * takes its fullname from the subscribed list, which is how the polling slice
 * keys activity, so the row ages like its subscribed twin. Reddit sends only
 * display names for feed members, so an unsubscribed member gets a
 * placeholder fullname and no activity.
 */
function genNavItems(
  multiRedditSubs: SubredditItem[],
  sortPath: string,
  subscribed: EntityState<SubredditData, string>['entities']
): ReactElement[] {
  // Create a map of subreddits keyed by lowercase display name to remove duplicates
  const multiRedditSubsKeyed = multiRedditSubs.reduce<Record<string, string>>(
    (acc, subreddit) => ({
      ...acc,
      [subreddit.name.toLowerCase()]: subreddit.name,
    }),
    {}
  );

  // Sort and map to NavigationItem components
  return Object.keys(multiRedditSubsKeyed)
    .sort()
    .map((key) => {
      const subredditName = multiRedditSubsKeyed[key];
      const item: SubredditData = {
        id: subredditName,
        name: subscribed[key]?.name ?? `t5_${subredditName}`,
        display_name: subredditName,
        display_name_prefixed: `r/${subredditName}`,
        title: subredditName,
        description: null,
        description_html: null,
        public_description: null,
        subscribers: null,
        created: 0,
        created_utc: 0,
        lang: 'en',
        over18: false,
        subreddit_type: 'public',
        header_img: null,
        header_size: null,
        icon_img: null,
        url: `/r/${subredditName}/`,
      };
      return (
        <NavigationItem
          href={buildSubredditHref(item.url, sortPath)}
          item={item}
          key={item.name}
          trigger={false}
        />
      );
    });
}

function MultiRedditsSubs({
  multiRedditSubs,
}: MultiRedditsSubsProps): ReactElement | null {
  const sortPath = useSubredditSortPath();
  const subscribed = useSubscribedEntities();

  if (multiRedditSubs?.length === 0) {
    return null;
  }

  const navItems = genNavItems(multiRedditSubs, sortPath, subscribed);
  return <ul className="nav subnav ps-2">{navItems}</ul>;
}

export default MultiRedditsSubs;
