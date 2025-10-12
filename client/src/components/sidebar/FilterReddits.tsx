import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import type { AppDispatch } from '@/types/redux';
import { useAppSelector } from '@/redux/hooks';
import { subredditsFilter } from '@/redux/actions/subreddits';
import { hotkeyStatus } from '@/common';

function FilterReddits() {
  const filterInput = useRef<HTMLInputElement>(null);
  const filter = useAppSelector((state) => state.subredditsFilter);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  /**
   * Set the subreddit filter data.
   */
  const filterReddits = (event: React.ChangeEvent<HTMLInputElement>) => {
    const filterText = event.target.value;
    // Always reset the index.
    const activeIndex = 0;
    if (!filterText) {
      dispatch(subredditsFilter({ filterText: '', activeIndex }));
      return;
    }
    dispatch(subredditsFilter({ filterText, activeIndex }));
  };

  /**
   * Helper to clear the filter textbox
   */
  const clearSearch = useCallback(() => {
    const filterText = '';
    const activeIndex = 0;
    dispatch(subredditsFilter({ filterText, activeIndex }));
  }, [dispatch]);

  /**
   * Disable the hotkeys when using the filter.
   */
  const setFocus = () => {
    const asideContent = document.getElementById('aside-content');
    if (asideContent) {
      asideContent.scrollTop = 0;
    }
    const active = true;
    filterInput.current?.select();
    dispatch(subredditsFilter({ active }));
  };

  /**
   * Enable the hotkeys when not in a textbox.
   */
  const setBlur = () => {
    const active = false;
    const activeIndex = 0;
    dispatch(subredditsFilter({ active, activeIndex }));
  };

  const handleFilterHotkey = useCallback(
    (event: KeyboardEvent) => {
      const pressedKey = event.key;

      if (hotkeyStatus()) {
        switch (pressedKey) {
          case 'F':
          case 'q':
            filterInput.current?.focus();
            document.body.classList.add('show-menu');
            clearSearch();
            event.preventDefault();
            break;
          default:
            break;
        }
      } else if (filter.active) {
        // Filter is active
        switch (pressedKey) {
          case 'ArrowUp': {
            const activeIndex = filter.activeIndex - 1;
            if (activeIndex >= 0) {
              dispatch(subredditsFilter({ activeIndex }));
            }
            event.preventDefault();
            break;
          }
          case 'ArrowDown': {
            // Query DOM only when needed for navigation
            const subLength = document.querySelectorAll(
              '#sidebar-subreddits .nav-item a, #sidebar-search-results .nav-item a'
            ).length;
            if (subLength <= filter.activeIndex + 1) {
              break;
            }
            const activeIndex = filter.activeIndex + 1;
            dispatch(subredditsFilter({ activeIndex }));
            event.preventDefault();
            break;
          }
          case 'Enter': {
            const trigger = document.querySelector<HTMLAnchorElement>(
              '#sidebar-subreddits .nav-item a.trigger, #sidebar-search-results .nav-item a.trigger'
            );
            if (trigger?.pathname) {
              navigate(trigger.pathname);
            }
            document.body.classList.remove('show-menu');
            filterInput.current?.blur();
            break;
          }
          case 'Escape':
            filterInput.current?.blur();
            document.body.classList.remove('show-menu');
            clearSearch();
            break;
          default:
            break;
        }
      }
    },
    [filter.active, filter.activeIndex, navigate, dispatch, clearSearch]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleFilterHotkey);
    return () => {
      document.removeEventListener('keydown', handleFilterHotkey);
    };
  }, [filter.active, filter.activeIndex, handleFilterHotkey]);

  return (
    <div
      className={`filterText w-100 d-flex m-0 p-2 ${
        filter.active ? 'filter-focused' : 'filter-unfocused'
      }`}
    >
      <Form.Control
        className="w-100 py-0"
        id="subreddit-filter"
        placeholder="Filter"
        ref={filterInput}
        size="sm"
        type="text"
        value={filter.filterText}
        onBlur={setBlur}
        onChange={filterReddits}
        onFocus={setFocus}
      />
      {(filter.active || filter.filterText) && (
        <i
          aria-hidden
          aria-label="Clear Filter Box"
          className="far fa-times-circle form-control-clear filter-clear"
          role="button"
          onClick={clearSearch}
        />
      )}
    </div>
  );
}

export default FilterReddits;
