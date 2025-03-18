import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { redditFetchMultis } from '../../redux/actions/reddit';
import MultiRedditsItem from './MultiRedditsItem';
import { setMenuStatus, getMenuStatus } from '../../common';
import MultiRedditsAdd from './MultiRedditsAdd';

function MultiReddits() {
  const menuId = 'multis';

  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(getMenuStatus(menuId, true));
  const [showAdd, setShowAdd] = useState(false);

  const multireddits = useSelector((state) => state.redditMultiReddits);
  const redditBearer = useSelector((state) => state.redditBearer);
  const dispatch = useDispatch();

  useEffect(() => {
    const getMultis = async () => {
      if (redditBearer.status === 'auth') {
        await dispatch(redditFetchMultis());
        setLoading(false);
      }
    };

    getMultis();
  }, [dispatch, redditBearer.status, setLoading]);

  if (redditBearer.status !== 'auth') {
    return null;
  }

  const reloadMultis = async () => {
    setLoading(true);
    await dispatch(redditFetchMultis(true));
    setLoading(false);
  };

  const generateMultiItems = () => {
    const navigationItems = [];

    if (multireddits.multis) {
      multireddits.multis.forEach((item) => {
        const key = `${item.data.display_name}-${item.data.created}`;
        navigationItems.push(<MultiRedditsItem item={item} key={key} />);
      });
    }

    return navigationItems;
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
    setMenuStatus(menuId, !showMenu);
  };

  if (multireddits) {
    const multis = generateMultiItems();
    if (multis.length) {
      let spinnerClass = 'fas fa-sync-alt reload';
      let multisClass = 'nav flex-column';

      if (loading) {
        spinnerClass += ' fa-spin';
        multisClass += ' faded';
      }

      const caretClass = showMenu
        ? 'fas fa-caret-down menu-caret'
        : 'fas fa-caret-right menu-caret';

      const showAddClass = !showAdd ? 'fas fa-plus me-1' : 'fas fa-minus me-1';

      return (
        <div id="sidebar-multis">
          <div className="sidebar-heading d-flex text-muted">
            <span
              className="me-auto show-cursor"
              role="presentation"
              onClick={toggleMenu}
            >
              <i className={caretClass} /> Custom Feeds
            </span>
            {showMenu && (
              <span>
                <i
                  aria-label="Add Custom Feed"
                  className={showAddClass}
                  role="button"
                  tabIndex="0"
                  onClick={() => setShowAdd(!showAdd)}
                  onKeyDown={() => setShowAdd(!showAdd)}
                />
                <i
                  aria-label="Reload Multis"
                  className={spinnerClass}
                  role="button"
                  tabIndex="0"
                  onClick={reloadMultis}
                  onKeyDown={reloadMultis}
                />
              </span>
            )}
          </div>
          {showAdd && (
            <MultiRedditsAdd
              reloadMultis={reloadMultis}
              setShowAdd={setShowAdd}
            />
          )}
          {showMenu && <ul className={multisClass}>{multis}</ul>}
        </div>
      );
    }
    return null;
  }
  return null;
}

MultiReddits.propTypes = {};

export default MultiReddits;
