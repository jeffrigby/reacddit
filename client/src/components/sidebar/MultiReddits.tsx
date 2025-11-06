import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { ReactElement, KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faSyncAlt,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { useGetMultiRedditsQuery } from '@/redux/api';
import MultiRedditsItem from './MultiRedditsItem';
import { setMenuStatus, getMenuStatus } from '../../common';
import MultiRedditsAdd from './MultiRedditsAdd';

const MENU_ID = 'multis';

function MultiReddits(): ReactElement | null {
  const [showMenu, setShowMenu] = useState<boolean>(
    getMenuStatus(MENU_ID, true)
  );
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const bearerStatus = useAppSelector((state) => state.redditBearer.status);
  const prevStatusRef = useRef<string | null>(null);

  // RTK Query hook - only fetch when authenticated
  const {
    data: multireddits,
    isLoading,
    isFetching,
    refetch,
  } = useGetMultiRedditsQuery(
    { expandSubreddits: true },
    {
      skip: bearerStatus !== 'auth', // Don't fetch if not authenticated
    }
  );

  // Clear cache when auth status changes
  useEffect(() => {
    if (
      prevStatusRef.current !== null &&
      prevStatusRef.current !== bearerStatus
    ) {
      // RTK Query will automatically handle cache invalidation
      // when the component unmounts or the query is skipped
    }
    prevStatusRef.current = bearerStatus;
  }, [bearerStatus]);

  const reloadMultis = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  const toggleMenu = useCallback((): void => {
    setShowMenu((prev) => {
      const newValue = !prev;
      setMenuStatus(MENU_ID, newValue);
      return newValue;
    });
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent, action: () => void): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        action();
      }
    },
    []
  );

  const multiItems = useMemo(() => {
    if (!multireddits || multireddits.length === 0) {
      return [];
    }

    return multireddits.map(
      (item: { data: { display_name: string; created: number } }) => {
        const key = `${item.data.display_name}-${item.data.created}`;
        return <MultiRedditsItem item={item} key={key} />;
      }
    );
  }, [multireddits]);

  // Don't render if not authenticated, no data, or empty array
  if (bearerStatus !== 'auth' || !multireddits || multiItems.length === 0) {
    return null;
  }

  const multisClass =
    isLoading || isFetching ? 'nav flex-column faded' : 'nav flex-column';
  const caretIcon = showMenu ? faCaretDown : faCaretRight;
  const showAddIcon = showAdd ? faMinus : faPlus;

  return (
    <div id="sidebar-multis">
      <div className="sidebar-heading d-flex text-muted">
        <span
          className="me-auto show-cursor"
          role="presentation"
          tabIndex={0}
          onClick={toggleMenu}
          onKeyDown={(e) => handleKeyPress(e, toggleMenu)}
        >
          <FontAwesomeIcon className="menu-caret" icon={caretIcon} /> Custom
          Feeds
        </span>
        {showMenu && (
          <span>
            <FontAwesomeIcon
              aria-label="Add Custom Feed"
              className="me-1"
              icon={showAddIcon}
              role="button"
              tabIndex={0}
              onClick={() => setShowAdd((prev) => !prev)}
              onKeyDown={(e) =>
                handleKeyPress(e, () => setShowAdd((prev) => !prev))
              }
            />
            <FontAwesomeIcon
              aria-label="Reload Multis"
              className="reload"
              icon={faSyncAlt}
              role="button"
              spin={isFetching}
              tabIndex={0}
              onClick={reloadMultis}
              onKeyDown={(e) => handleKeyPress(e, reloadMultis)}
            />
          </span>
        )}
      </div>
      {showAdd && (
        <MultiRedditsAdd reloadMultis={reloadMultis} setShowAdd={setShowAdd} />
      )}
      {showMenu && <ul className={multisClass}>{multiItems}</ul>}
    </div>
  );
}

export default MultiReddits;
