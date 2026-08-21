import { describe, expect, it } from 'vitest';
import { getInternalRedditPath, isShareHref } from '../redditLinks';

describe('getInternalRedditPath', () => {
  describe('post permalinks', () => {
    it.each([
      [
        '/r/pics/comments/abc123/some_title/',
        '/r/pics/comments/abc123/some_title/',
      ],
      [
        '/r/pics/comments/abc123/some_title/def456/',
        '/r/pics/comments/abc123/some_title/def456/',
      ],
      [
        'https://old.reddit.com/r/IAmA/comments/38jawf/im_the_president/',
        '/r/IAmA/comments/38jawf/im_the_president/',
      ],
      [
        'https://www.reddit.com/r/pics/comments/abc123/t/def456/?context=3',
        '/r/pics/comments/abc123/t/def456/?context=3',
      ],
    ])('resolves %s', (href, expected) => {
      expect(getInternalRedditPath(href)).toBe(expected);
    });
  });

  describe('subreddit listings', () => {
    it.each([
      ['/r/all', '/r/all'],
      ['/r/bestofredditupdates', '/r/bestofredditupdates'],
      ['/r/pics/top', '/r/pics/top'],
      ['https://reddit.com/r/technology/new', '/r/technology/new'],
      ['/r/pics+aww', '/r/pics+aww'],
    ])('resolves %s', (href, expected) => {
      expect(getInternalRedditPath(href)).toBe(expected);
    });

    it('leaves a subreddit sub-page with no route external', () => {
      expect(getInternalRedditPath('/r/pics/wiki')).toBeNull();
      expect(getInternalRedditPath('/r/pics/wiki/index')).toBeNull();
    });
  });

  describe('user profiles', () => {
    it.each([
      ['/u/spez', '/user/spez/overview'],
      ['/user/spez', '/user/spez/overview'],
      ['/u/spez/comments', '/user/spez/comments'],
      ['/user/spez/submitted/top', '/user/spez/submitted/top'],
      ['/user/spez/m/mymulti', '/user/spez/m/mymulti'],
      ['/user/spez/m/mymulti/hot', '/user/spez/m/mymulti/hot'],
    ])('resolves %s', (href, expected) => {
      expect(getInternalRedditPath(href)).toBe(expected);
    });

    it('leaves user routes the app cannot render external', () => {
      // A profile post permalink — no matching route.
      expect(
        getInternalRedditPath('/user/spez/comments/abc123/title/')
      ).toBeNull();
      // Not one of the user listing targets.
      expect(getInternalRedditPath('/user/spez/about')).toBeNull();
    });
  });

  describe('links that must stay external', () => {
    it.each([
      ['https://example.com/r/pics'],
      ['//evil.com/r/pics'],
      ['https://notreddit.com/r/pics'],
      ['https://reddit.com.evil.test/r/pics'],
      ['/message/compose'],
      ['/r/pics/s/aBcDeF'],
      ['https://redd.it/abc123'],
      ['https://preview.redd.it/x.jpeg?width=1131'],
      ['mailto:someone@example.com'],
      [''],
    ])('rejects %s', (href) => {
      expect(getInternalRedditPath(href)).toBeNull();
    });
  });
});

describe('share links', () => {
  it.each([
    ['https://www.reddit.com/r/nsfwbanned/s/VYt0GPKA5q'],
    ['https://reddit.com/r/AskReddit/s/Xyz789'],
  ])('recognises %s', (href) => {
    expect(isShareHref(href)).toBe(true);
  });

  // The resolver server rejects non-https links and every host but
  // (www.)reddit.com, so the client must not batch those either.
  it.each([
    ['https://www.reddit.com/r/pics/comments/abc/t/'],
    ['http://www.reddit.com/r/pics/s/aBcDeF'],
    ['https://old.reddit.com/r/pics/s/aBcDeF'],
    ['https://redd.it/abc123'],
    ['https://i.redd.it/wjo0b91eosah1.jpeg'],
  ])('rejects %s', (href) => {
    expect(isShareHref(href)).toBe(false);
  });
});
