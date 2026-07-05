import { describe, it, expect } from 'vitest';
// Initialize the embed registry first. redditcom.ts, embeds.ts and redd.ts form
// a circular dependency (embeds.ts eager-globs the domain modules, and redd.ts
// re-exports redditcom.ts's default). Importing redditcom.ts directly as the
// first module would evaluate redd.ts's default re-export before redditcom.ts
// finished initializing, throwing a TDZ error. Loading embeds.ts first mirrors
// the app's real load order (index.ts imports embeds before redditcom) so every
// module in the cycle initializes cleanly.
import '@/components/posts/embeds/embeds';
import {
  extractPostId,
  isShareLink,
  isRedditShareLink,
} from '@/components/posts/embeds/domains/redditcom';

describe('extractPostId', () => {
  it('extracts the id from a standard reddit.com comments URL', () => {
    expect(
      extractPostId('https://www.reddit.com/r/pics/comments/abc123/some_title/')
    ).toBe('abc123');
  });

  it('extracts the id without a trailing slug', () => {
    expect(
      extractPostId('https://reddit.com/r/AskReddit/comments/xyz789/')
    ).toBe('xyz789');
  });

  it('extracts the id from old.reddit.com', () => {
    expect(
      extractPostId('https://old.reddit.com/r/sub/comments/def456/title/')
    ).toBe('def456');
  });

  it('extracts the id from a bare redd.it short link', () => {
    expect(extractPostId('https://redd.it/abc123')).toBe('abc123');
  });

  it('extracts the id from a www.redd.it short link', () => {
    expect(extractPostId('https://www.redd.it/abc123')).toBe('abc123');
  });

  it('extracts the id from a protocol-relative redd.it short link', () => {
    expect(extractPostId('//redd.it/abc123')).toBe('abc123');
  });

  // Regression: media subdomains carry FILENAMES in the path, not post IDs.
  // These must never be treated as post IDs (would trigger junk /api/info calls).
  it('returns null for an i.redd.it image URL', () => {
    expect(extractPostId('https://i.redd.it/wjo0b91eosah1.jpeg')).toBeNull();
  });

  it('returns null for a preview.redd.it image URL (with query string)', () => {
    expect(
      extractPostId(
        'https://preview.redd.it/5k2e6d6ggtah1.jpeg?width=640&auto=webp&s=deadbeef'
      )
    ).toBeNull();
  });

  it('returns null for a v.redd.it video URL', () => {
    expect(extractPostId('https://v.redd.it/abcd1234')).toBeNull();
  });

  it('returns null for an unrelated subdomain of redd.it', () => {
    expect(extractPostId('https://external-i.redd.it/foo.png')).toBeNull();
  });

  it('does not match redd.it appearing in a path segment of another host', () => {
    expect(extractPostId('https://evil.com/redd.it/abc123')).toBeNull();
  });

  it('returns null for a non-Reddit URL', () => {
    expect(extractPostId('https://youtube.com/watch?v=123')).toBeNull();
  });

  it('returns null for a Reddit share link (resolved server-side, not here)', () => {
    expect(
      extractPostId('https://www.reddit.com/r/pics/s/AbCdEf123')
    ).toBeNull();
  });
});

describe('isShareLink', () => {
  it('accepts a www.reddit.com share link', () => {
    expect(isShareLink('https://www.reddit.com/r/pics/s/AbCdEf123')).toBe(true);
  });

  it('accepts a reddit.com share link without www', () => {
    expect(isShareLink('https://reddit.com/r/AskReddit/s/Xyz789')).toBe(true);
  });

  it('rejects a standard comments URL', () => {
    expect(
      isShareLink('https://www.reddit.com/r/pics/comments/abc123/title/')
    ).toBe(false);
  });

  it('rejects an http (non-https) share link', () => {
    expect(isShareLink('http://www.reddit.com/r/pics/s/AbCdEf123')).toBe(false);
  });

  it('rejects a redd.it short link', () => {
    expect(isShareLink('https://redd.it/abc123')).toBe(false);
  });

  it('rejects an i.redd.it image URL', () => {
    expect(isShareLink('https://i.redd.it/wjo0b91eosah1.jpeg')).toBe(false);
  });

  it('exposes isRedditShareLink as an alias of isShareLink', () => {
    expect(isRedditShareLink).toBe(isShareLink);
  });
});
