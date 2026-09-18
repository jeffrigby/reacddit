import { describe, expect, it } from 'vitest';
import { navTargetDomId } from '../navHelpers';

describe('navTargetDomId', () => {
  it('is a plain token built from the section and the path', () => {
    expect(navTargetDomId('subscribed', '/r/pics')).toBe(
      'nav-subscribed-r-pics'
    );
  });

  it('keeps sort and time filter so two hrefs never share an id', () => {
    expect(navTargetDomId('search', '/r/pics/top?t=week')).toBe(
      'nav-search-r-pics-top-t-week'
    );
    expect(navTargetDomId('search', '/r/pics/top?t=week')).not.toBe(
      navTargetDomId('search', '/r/pics/top?t=month')
    );
  });

  it('differs by section for the same path', () => {
    expect(navTargetDomId('subscribed', '/r/pics')).not.toBe(
      navTargetDomId('search', '/r/pics')
    );
  });
});
