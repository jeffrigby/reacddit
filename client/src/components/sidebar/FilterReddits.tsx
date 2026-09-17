import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  filterUpdated,
  selectFilterActive,
  selectFilterEngaged,
  selectFilterIndex,
  selectFilterText,
  selectNavTargetCount,
  selectSelectedNavTarget,
} from '@/redux/slices/subredditFilterSlice';
import { hotkeyStatus } from '@/common';

function FilterReddits() {
  const filterInput = useRef<HTMLInputElement>(null);
  const filterText = useAppSelector(selectFilterText);
  const active = useAppSelector(selectFilterActive);
  const engaged = useAppSelector(selectFilterEngaged);
  const activeIndex = useAppSelector(selectFilterIndex);
  const navTargetCount = useAppSelector(selectNavTargetCount);
  const selectedTarget = useAppSelector(selectSelectedNavTarget);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  /**
   * Set the subreddit filter data.
   */
  const filterReddits = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(filterUpdated({ filterText: event.target.value, activeIndex: 0 }));
  };

  /**
   * Helper to clear the filter textbox
   * @param shouldBlur - Whether to blur the input after clearing (default: false)
   */
  const clearSearch = useCallback(
    (shouldBlur = false) => {
      dispatch(filterUpdated({ filterText: '', activeIndex: 0 }));
      if (shouldBlur && filterInput.current) {
        filterInput.current.blur();
      }
    },
    [dispatch]
  );

  /**
   * Disable the hotkeys when using the filter.
   */
  const setFocus = () => {
    const asideContent = document.getElementById('aside-content');
    if (asideContent) {
      asideContent.scrollTop = 0;
    }
    filterInput.current?.select();
    dispatch(filterUpdated({ active: true }));
  };

  /**
   * Enable the hotkeys when not in a textbox.
   */
  const setBlur = () => {
    dispatch(filterUpdated({ active: false, activeIndex: 0 }));
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
      } else if (active) {
        switch (pressedKey) {
          case 'ArrowUp': {
            if (engaged && activeIndex > 0) {
              dispatch(filterUpdated({ activeIndex: activeIndex - 1 }));
            }
            event.preventDefault();
            break;
          }
          case 'ArrowDown': {
            if (!engaged || activeIndex + 1 >= navTargetCount) {
              break;
            }
            dispatch(filterUpdated({ activeIndex: activeIndex + 1 }));
            event.preventDefault();
            break;
          }
          case 'Enter': {
            if (selectedTarget) {
              navigate(selectedTarget);
            }
            document.body.classList.remove('show-menu');
            filterInput.current?.blur();
            break;
          }
          case 'Escape':
            document.body.classList.remove('show-menu');
            clearSearch(true); // Blur on Escape to exit filter mode
            break;
          default:
            break;
        }
      }
    },
    [
      active,
      engaged,
      activeIndex,
      navTargetCount,
      selectedTarget,
      navigate,
      dispatch,
      clearSearch,
    ]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleFilterHotkey);
    return () => {
      document.removeEventListener('keydown', handleFilterHotkey);
    };
  }, [handleFilterHotkey]);

  return (
    <div
      className={`filterText w-100 d-flex m-0 p-2 ${
        active ? 'filter-focused' : 'filter-unfocused'
      }`}
    >
      <Form.Control
        className="w-100 py-0"
        id="subreddit-filter"
        placeholder="Filter"
        ref={filterInput}
        size="sm"
        type="text"
        value={filterText}
        onBlur={setBlur}
        onChange={filterReddits}
        onFocus={setFocus}
      />
      {filterText && (
        <FontAwesomeIcon
          aria-hidden
          aria-label="Clear Filter Box"
          className="form-control-clear filter-clear"
          icon={faTimesCircle}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              clearSearch();
            }
          }}
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent blur on mousedown
            clearSearch();
          }}
        />
      )}
    </div>
  );
}

export default FilterReddits;
