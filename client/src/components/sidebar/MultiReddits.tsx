import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactElement, KeyboardEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faSyncAlt,
  faPlus,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchMultiReddits } from '@/redux/slices/multiRedditsSlice';
import MultiRedditsItem from './MultiRedditsItem';
import { setMenuStatus, getMenuStatus } from '../../common';
import MultiRedditsAdd from './MultiRedditsAdd';

const MENU_ID = 'multis';

function MultiReddits(): ReactElement | null {
  const [loading, setLoading] = useState<boolean>(true);
  const [showMenu, setShowMenu] = useState<boolean>(
    getMenuStatus(MENU_ID, true)
  );
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const multireddits = useAppSelector((state) => state.redditMultiReddits);
  const redditBearer = useAppSelector((state) => state.redditBearer);
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function getMultis(): Promise<void> {
      if (redditBearer.status === 'auth') {
        await dispatch(fetchMultiReddits());
        setLoading(false);
      }
    }

    getMultis();
  }, [dispatch, redditBearer.status]);

  const reloadMultis = useCallback(async (): Promise<void> => {
    setLoading(true);
    await dispatch(fetchMultiReddits(true));
    setLoading(false);
  }, [dispatch]);

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
    if (!multireddits?.multis) {
      return [];
    }

    return multireddits.multis.map((item) => {
      const key = `${item.data.display_name}-${item.data.created}`;
      return <MultiRedditsItem item={item} key={key} />;
    });
  }, [multireddits?.multis]);

  if (
    redditBearer.status !== 'auth' ||
    multireddits.status !== 'succeeded' ||
    multiItems.length === 0
  ) {
    return null;
  }

  const multisClass = loading ? 'nav flex-column faded' : 'nav flex-column';
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
              spin={loading}
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
