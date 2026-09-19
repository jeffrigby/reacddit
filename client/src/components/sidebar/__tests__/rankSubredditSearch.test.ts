import { describe, expect, it } from 'vitest';
import type { SubredditData, SubredditType, Thing } from '@/types/redditApi';
import {
  RELATED_TIER_LIMIT,
  rankSubredditSearch,
} from '../rankSubredditSearch';

interface SubOverrides {
  subscribers?: number | null;
  subredditType?: SubredditType;
  contributor?: boolean;
}

function sub(
  displayName: string,
  {
    subscribers = 0,
    subredditType = 'public',
    contributor = false,
  }: SubOverrides = {}
): Thing<SubredditData> {
  return {
    kind: 't5',
    data: {
      display_name: displayName,
      subscribers,
      subreddit_type: subredditType,
      user_is_contributor: contributor,
      user_is_subscriber: false,
    } as SubredditData,
  };
}

const NONE: ReadonlySet<string> = new Set();

function names(
  children: Thing<SubredditData>[],
  term: string,
  subs: ReadonlySet<string> = NONE
) {
  return rankSubredditSearch(children, term, subs).map(
    (result) => result.subreddit.display_name
  );
}

describe('rankSubredditSearch', () => {
  it('returns nothing without children or a term', () => {
    expect(rankSubredditSearch(undefined, 'cook', NONE)).toEqual([]);
    expect(rankSubredditSearch([sub('cooking')], '', NONE)).toEqual([]);
    expect(rankSubredditSearch([sub('cooking')], '   ', NONE)).toEqual([]);
  });

  it('orders prefix matches before contains matches before the rest', () => {
    const children = [
      sub('AskReddit', { subscribers: 40_000_000 }),
      sub('slowcooking', { subscribers: 1_000 }),
      sub('Cooking', { subscribers: 3_000 }),
    ];

    expect(names(children, 'cook')).toEqual([
      'Cooking',
      'slowcooking',
      'AskReddit',
    ]);
  });

  it('tags each result with its tier', () => {
    const children = [sub('Cooking'), sub('slowcooking'), sub('nfl')];

    expect(
      rankSubredditSearch(children, 'cook', NONE).map((result) => result.tier)
    ).toEqual(['prefix', 'contains', 'related']);
  });

  it('matches case-insensitively on name and term', () => {
    const children = [sub('COOKING'), sub('SlowCooking')];

    expect(names(children, 'CoOk')).toEqual(['COOKING', 'SlowCooking']);
  });

  it('sorts each tier by subscriber count, missing counts last', () => {
    const children = [
      sub('cookA', { subscribers: null }),
      sub('cookB', { subscribers: 10 }),
      sub('cookC', { subscribers: 5_000 }),
    ];

    expect(names(children, 'cook')).toEqual(['cookC', 'cookB', 'cookA']);
  });

  it('drops subscribed subreddits and user profile subreddits', () => {
    const children = [
      sub('Cooking'),
      sub('cookingforbeginners'),
      sub('u_cookiemonster', { subredditType: 'user' }),
    ];

    expect(names(children, 'cook', new Set(['cooking']))).toEqual([
      'cookingforbeginners',
    ]);
  });

  it('ignores term characters a display name cannot contain', () => {
    const children = [
      sub('AskReddit', { subscribers: 40_000_000 }),
      sub('Cooking', { subscribers: 3_000 }),
    ];

    expect(names(children, 'ask reddit')).toEqual(['AskReddit', 'Cooking']);
    expect(names([sub('cooking')], 'cook ing')).toEqual(['cooking']);
    expect(
      rankSubredditSearch(children, 'ask reddit', NONE).map(
        (result) => result.tier
      )
    ).toEqual(['prefix', 'related']);
  });

  it('leaves a term with no name characters in the capped related tier', () => {
    const children = Array.from({ length: 7 }, (_unused, idx) =>
      sub(`sub${idx}`, { subscribers: idx })
    );

    const ranked = rankSubredditSearch(children, '!!!', NONE);

    expect(ranked).toHaveLength(RELATED_TIER_LIMIT);
    expect(ranked.every((result) => result.tier === 'related')).toBe(true);
  });

  it('caps the related tier and keeps name matches in full', () => {
    const nameMatches = Array.from({ length: 8 }, (_unused, idx) =>
      sub(`cook${idx}`, { subscribers: idx })
    );
    const related = Array.from({ length: 9 }, (_unused, idx) =>
      sub(`other${idx}`, { subscribers: idx })
    );

    const ranked = rankSubredditSearch(
      [...nameMatches, ...related],
      'cook',
      NONE
    );

    expect(ranked.filter((result) => result.tier === 'prefix')).toHaveLength(8);
    expect(ranked.filter((result) => result.tier === 'related')).toHaveLength(
      RELATED_TIER_LIMIT
    );
    expect(names([...nameMatches, ...related], 'cook').slice(8)).toEqual([
      'other8',
      'other7',
      'other6',
      'other5',
      'other4',
    ]);
  });
});

describe('rankSubredditSearch gated subreddits', () => {
  it('drops private, gold-only and employee-only subreddits', () => {
    expect(
      names(
        [
          sub('secretpics', { subredditType: 'private' }),
          sub('goldpics', { subredditType: 'gold_only' }),
          sub('adminpics', { subredditType: 'employees_only' }),
          sub('pics'),
        ],
        'pics'
      )
    ).toEqual(['pics']);
  });

  it('keeps a private subreddit the account is approved for', () => {
    expect(
      names(
        [sub('secretpics', { subredditType: 'private', contributor: true })],
        'pics'
      )
    ).toEqual(['secretpics']);
  });

  it('keeps restricted subreddits, which anyone can read', () => {
    expect(
      names([sub('readonlypics', { subredditType: 'restricted' })], 'pics')
    ).toEqual(['readonlypics']);
  });
});

describe('rankSubredditSearch sort', () => {
  const children = [
    sub('picsofcats', { subscribers: 50 }),
    sub('Pics', { subscribers: 10 }),
    sub('epicpics', { subscribers: 90 }),
  ];

  it('orders the whole list by subscribers when asked', () => {
    expect(
      rankSubredditSearch(children, 'pics', NONE, 'subscribers').map(
        (r) => r.subreddit.display_name
      )
    ).toEqual(['epicpics', 'picsofcats', 'Pics']);
  });

  it('orders the whole list by name, case-insensitively, when asked', () => {
    expect(
      rankSubredditSearch(children, 'pics', NONE, 'name').map(
        (r) => r.subreddit.display_name
      )
    ).toEqual(['epicpics', 'Pics', 'picsofcats']);
  });

  it('keeps the tiers under relevance', () => {
    expect(
      rankSubredditSearch(children, 'pics', NONE, 'relevance').map(
        (r) => r.subreddit.display_name
      )
    ).toEqual(['picsofcats', 'Pics', 'epicpics']);
  });
});
