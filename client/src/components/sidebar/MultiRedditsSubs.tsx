import type { ReactElement } from 'react';
import type { SubredditData } from '@/types/redditApi';
import NavigationItem from './NavigationItem';

interface SubredditItem {
  name: string;
}

interface MultiRedditsSubsProps {
  multiRedditSubs: SubredditItem[];
}

function genNavItems(multiRedditSubs: SubredditItem[]): ReactElement[] {
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
        name: `t5_${subredditName}`,
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
      return <NavigationItem item={item} key={item.name} trigger={false} />;
    });
}

function MultiRedditsSubs({
  multiRedditSubs,
}: MultiRedditsSubsProps): ReactElement | null {
  if (multiRedditSubs?.length === 0) {
    return null;
  }

  const navItems = genNavItems(multiRedditSubs);
  return <ul className="nav subnav ps-2">{navItems}</ul>;
}

export default MultiRedditsSubs;
