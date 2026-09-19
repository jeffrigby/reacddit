import { describe, expect, it } from 'vitest';
import type { AccountData, SubredditData, Thing } from '@/types/redditApi';
import {
  RELATED_TIER_LIMIT,
  USER_RESULT_LIMIT,
  nameTermOf,
  rankSubredditSearch,
  rankUserSearch,
  verifiedDirect,
} from '../rankSubredditSearch';

interface SubOverrides {
  subscribers?: number | null;
  subredditType?: SubredditData['subreddit_type'];
}

function sub(
  displayName: string,
  { subscribers = 0, subredditType = 'public' }: SubOverrides = {}
): Thing<SubredditData> {
  return {
    kind: 't5',
    data: {
      display_name: displayName,
      subscribers,
      subreddit_type: subredditType,
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

describe('nameTermOf', () => {
  it('lowercases and drops characters a name cannot hold', () => {
    expect(nameTermOf('  r/Ask Reddit! ')).toBe('raskreddit');
    expect(nameTermOf('under_score')).toBe('under_score');
  });
});

function account(name: string, suspended = false): Thing<AccountData> {
  return {
    kind: 't2',
    data: {
      id: name.toLowerCase(),
      name,
      is_suspended: suspended,
    } as AccountData,
  };
}

describe('rankUserSearch', () => {
  it('puts names starting with the term first and keeps the rest in order', () => {
    const ranked = rankUserSearch(
      [account('Evil_Spez'), account('spez'), account('Spez-zo')],
      'spez'
    );
    expect(ranked.map((u) => u.name)).toEqual(['spez', 'Spez-zo', 'Evil_Spez']);
  });

  it('drops suspended accounts and caps the list', () => {
    const many = Array.from({ length: USER_RESULT_LIMIT + 3 }, (_, i) =>
      account(`spez${i}`, i === 0)
    );
    const ranked = rankUserSearch(many, 'spez');
    expect(ranked).toHaveLength(USER_RESULT_LIMIT);
    expect(ranked.some((u) => u.name === 'spez0')).toBe(false);
  });

  it('returns nothing without a term or data', () => {
    expect(rankUserSearch(undefined, 'spez')).toEqual([]);
    expect(rankUserSearch([account('spez')], '')).toEqual([]);
  });
});

describe('verifiedDirect', () => {
  const none = new Set<string>();

  it('offers nothing without a term', () => {
    expect(verifiedDirect('', none, [], ['pics'], [], false)).toEqual({
      subreddit: null,
      user: null,
    });
  });

  it('offers a subreddit only when Reddit lists the exact name', () => {
    expect(
      verifiedDirect('pics', none, [], ['Pics', 'picrew'], [], undefined)
        .subreddit
    ).toBe('Pics');
    expect(
      verifiedDirect('pic', none, [], ['Pics', 'picrew'], [], undefined)
        .subreddit
    ).toBeNull();
    expect(
      verifiedDirect('pics', none, [], undefined, [], undefined).subreddit
    ).toBeNull();
  });

  it('withholds the subreddit when a row already leads there', () => {
    expect(
      verifiedDirect('pics', new Set(['pics']), [], ['pics'], [], undefined)
        .subreddit
    ).toBeNull();
    const listed = rankSubredditSearch([sub('Pics')], 'pics', none);
    expect(
      verifiedDirect('pics', none, listed, ['pics'], [], undefined).subreddit
    ).toBeNull();
  });

  it('offers a user only when the name is taken and not already listed', () => {
    expect(verifiedDirect('spez', none, [], [], [], false).user).toBe('spez');
    expect(verifiedDirect('spez', none, [], [], [], true).user).toBeNull();
    expect(verifiedDirect('spez', none, [], [], [], undefined).user).toBeNull();
    const users = rankUserSearch([account('Spez')], 'spez');
    expect(verifiedDirect('spez', none, [], [], users, false).user).toBeNull();
  });
});
