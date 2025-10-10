import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ReactElement, KeyboardEvent } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/types/redux';
import { useAppSelector } from '@/redux/hooks';
import { redditFetchMultis } from '../../redux/actions/reddit';
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
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    async function getMultis(): Promise<void> {
      if (redditBearer.status === 'auth') {
        await dispatch(redditFetchMultis());
        setLoading(false);
      }
    }

    getMultis();
  }, [dispatch, redditBearer.status]);

  const reloadMultis = useCallback(async (): Promise<void> => {
    setLoading(true);
    await dispatch(redditFetchMultis(true));
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
    !multireddits ||
    multiItems.length === 0
  ) {
    return null;
  }

  const spinnerClass = loading
    ? 'fas fa-sync-alt reload fa-spin'
    : 'fas fa-sync-alt reload';
  const multisClass = loading ? 'nav flex-column faded' : 'nav flex-column';
  const caretClass = showMenu
    ? 'fas fa-caret-down menu-caret'
    : 'fas fa-caret-right menu-caret';
  const showAddClass = showAdd ? 'fas fa-minus me-1' : 'fas fa-plus me-1';

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
          <i className={caretClass} /> Custom Feeds
        </span>
        {showMenu && (
          <span>
            <i
              aria-label="Add Custom Feed"
              className={showAddClass}
              role="button"
              tabIndex={0}
              onClick={() => setShowAdd((prev) => !prev)}
              onKeyDown={(e) =>
                handleKeyPress(e, () => setShowAdd((prev) => !prev))
              }
            />
            <i
              aria-label="Reload Multis"
              className={spinnerClass}
              role="button"
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
