import { describe, expect, it } from 'vitest';
import reducer, {
  filterCleared,
  filterUpdated,
  navSectionRegistered,
  navSectionUnregistered,
  selectNavTargetCount,
  selectNavTargets,
  selectSelectedNavTarget,
  type SubredditFilterState,
} from '@/redux/slices/subredditFilterSlice';

const initial = reducer(undefined, { type: '@@INIT' });

/** Slice state with the subscribed and search sections registered */
function twoSections(): SubredditFilterState {
  let state = reducer(
    initial,
    navSectionRegistered({
      id: 'search',
      order: 1,
      targets: ['/r/c/hot', '/r/d/hot'],
    })
  );
  state = reducer(
    state,
    navSectionRegistered({
      id: 'subscribed',
      order: 0,
      targets: ['/r/a/hot', '/r/b/hot'],
    })
  );
  return state;
}

describe('subredditFilterSlice nav registry', () => {
  it('flattens sections by order, not registration order', () => {
    expect(selectNavTargets.unwrapped(twoSections())).toEqual([
      '/r/a/hot',
      '/r/b/hot',
      '/r/c/hot',
      '/r/d/hot',
    ]);
  });

  it('resolves the selected target by index across sections', () => {
    const state = reducer(
      twoSections(),
      filterUpdated({ active: true, filterText: 'ask', activeIndex: 2 })
    );
    expect(selectNavTargetCount.unwrapped(state)).toBe(4);
    expect(selectSelectedNavTarget.unwrapped(state)).toBe('/r/c/hot');
  });

  it('selects nothing while the filter box holds no term', () => {
    const focusedEmpty = reducer(
      twoSections(),
      filterUpdated({ active: true, filterText: '', activeIndex: 2 })
    );
    expect(selectSelectedNavTarget.unwrapped(focusedEmpty)).toBeUndefined();

    const blurred = reducer(
      twoSections(),
      filterUpdated({ active: false, filterText: 'ask', activeIndex: 2 })
    );
    expect(selectSelectedNavTarget.unwrapped(blurred)).toBeUndefined();
  });

  it('leaves state untouched when a section re-registers unchanged', () => {
    const state = twoSections();
    const next = reducer(
      state,
      navSectionRegistered({
        id: 'subscribed',
        order: 0,
        targets: ['/r/a/hot', '/r/b/hot'],
      })
    );
    expect(next).toBe(state);
  });

  it('clamps activeIndex when a section shrinks', () => {
    const state = reducer(twoSections(), filterUpdated({ activeIndex: 3 }));
    const next = reducer(
      state,
      navSectionRegistered({ id: 'search', order: 1, targets: ['/r/c/hot'] })
    );
    expect(next.activeIndex).toBe(2);
  });

  it('clamps activeIndex to 0 when every section unregisters', () => {
    let state = reducer(twoSections(), filterUpdated({ activeIndex: 3 }));
    state = reducer(state, navSectionUnregistered('search'));
    state = reducer(state, navSectionUnregistered('subscribed'));
    expect(state.activeIndex).toBe(0);
    expect(selectNavTargets.unwrapped(state)).toEqual([]);
  });

  it('keeps registered sections when the filter box is cleared', () => {
    const state = reducer(
      reducer(
        twoSections(),
        filterUpdated({ filterText: 'ask', active: true })
      ),
      filterCleared()
    );
    expect(state.filterText).toBe('');
    expect(state.active).toBe(false);
    expect(selectNavTargets.unwrapped(state)).toHaveLength(4);
  });
});
