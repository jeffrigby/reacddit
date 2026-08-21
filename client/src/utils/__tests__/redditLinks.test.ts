import { describe, expect, it } from 'vitest';
import { getInternalRedditPath, isShareHref } from '../redditLinks';

describe('getInternalRedditPath', () => {
  describe('post permalinks', () => {
    it.each([
      [
        '/r/examplesub/comments/abc123/some_title/',
        '/r/examplesub/comments/abc123/some_title/',
      ],
      [
        '/r/examplesub/comments/abc123/some_title/def456/',
        '/r/examplesub/comments/abc123/some_title/def456/',
      ],
      [
        'https://old.reddit.com/r/examplesub/comments/abc123/some_title/',
        '/r/examplesub/comments/abc123/some_title/',
      ],
      [
        'https://www.reddit.com/r/examplesub/comments/abc123/t/def456/?context=3',
        '/r/examplesub/comments/abc123/t/def456/?context=3',
      ],
    ])('resolves %s', (href, expected) => {
      expect(getInternalRedditPath(href)).toBe(expected);
    });
  });

  describe('subreddit listings', () => {
    it.each([
      ['/r/examplesub', '/r/examplesub'],
      ['/r/examplesub/top', '/r/examplesub/top'],
      ['https://reddit.com/r/anothersub/new', '/r/anothersub/new'],
      ['/r/examplesub+anothersub', '/r/examplesub+anothersub'],
    ])('resolves %s', (href, expected) => {
      expect(getInternalRedditPath(href)).toBe(expected);
    });

    it('leaves a subreddit sub-page with no route external', () => {
      expect(getInternalRedditPath('/r/examplesub/wiki')).toBeNull();
      expect(getInternalRedditPath('/r/examplesub/wiki/index')).toBeNull();
    });
  });

  describe('user profiles', () => {
    it.each([
      ['/u/exampleuser', '/user/exampleuser/overview'],
      ['/user/exampleuser', '/user/exampleuser/overview'],
      ['/u/exampleuser/comments', '/user/exampleuser/comments'],
      ['/user/exampleuser/submitted/top', '/user/exampleuser/submitted/top'],
      ['/user/exampleuser/m/mymulti', '/user/exampleuser/m/mymulti'],
      ['/user/exampleuser/m/mymulti/hot', '/user/exampleuser/m/mymulti/hot'],
    ])('resolves %s', (href, expected) => {
      expect(getInternalRedditPath(href)).toBe(expected);
    });

    it('leaves user routes the app cannot render external', () => {
      // A profile post permalink — no matching route.
      expect(
        getInternalRedditPath('/user/exampleuser/comments/abc123/title/')
      ).toBeNull();
      // Not one of the user listing targets.
      expect(getInternalRedditPath('/user/exampleuser/about')).toBeNull();
    });
  });

  describe('links that must stay external', () => {
    it.each([
      ['https://example.com/r/examplesub'],
      ['//evil.com/r/examplesub'],
      ['https://notreddit.com/r/examplesub'],
      ['https://reddit.com.evil.test/r/examplesub'],
      ['/message/compose'],
      ['/r/examplesub/s/aBcDeF'],
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
    ['https://www.reddit.com/r/examplesub/s/aBcDeF123'],
    ['https://reddit.com/r/anothersub/s/Xyz789'],
  ])('recognises %s', (href) => {
    expect(isShareHref(href)).toBe(true);
  });

  // The resolver server rejects non-https links and every host but
  // (www.)reddit.com, so the client must not batch those either.
  it.each([
    ['https://www.reddit.com/r/examplesub/comments/abc/t/'],
    ['http://www.reddit.com/r/examplesub/s/aBcDeF'],
    ['https://old.reddit.com/r/examplesub/s/aBcDeF'],
    ['https://redd.it/abc123'],
    ['https://i.redd.it/examplefile.jpeg'],
  ])('rejects %s', (href) => {
    expect(isShareHref(href)).toBe(false);
  });
});
