import type { ReactElement } from 'react';
import type { SubredditData } from '@/types/redditApi';
import NavigationItem from './NavigationItem';

interface SubredditItem {
  name: string;
  data: SubredditData;
}

interface MultiRedditsSubsProps {
  multiRedditSubs: SubredditItem[];
}

function genNavItems(multiRedditSubs: SubredditItem[]): ReactElement[] {
  // Create a map of subreddits keyed by lowercase display name to remove duplicates
  const multiRedditSubsKeyed = multiRedditSubs.reduce<
    Record<string, SubredditData>
  >(
    (acc, subreddit) => ({
      ...acc,
      [subreddit.data.display_name.toLowerCase()]: subreddit.data,
    }),
    {}
  );

  // Sort and map to NavigationItem components
  return Object.keys(multiRedditSubsKeyed)
    .sort()
    .map((key) => {
      const item = multiRedditSubsKeyed[key];
      return <NavigationItem item={item} key={item.name} trigger={false} />;
    });
}

function MultiRedditsSubs({
  multiRedditSubs,
}: MultiRedditsSubsProps): ReactElement | null {
  if (!multiRedditSubs || multiRedditSubs.length === 0) {
    return null;
  }

  const navItems = genNavItems(multiRedditSubs);
  return <ul className="nav subnav ps-2">{navItems}</ul>;
}

export default MultiRedditsSubs;
