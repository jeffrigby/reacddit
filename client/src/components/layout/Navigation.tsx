import { useEffect, useCallback } from 'react';
import isEmpty from 'lodash/isEmpty';
import type { SubredditsFilterState } from '@/types/redux';
import MultiReddits from '../sidebar/MultiReddits';
import NavigationPrimaryLinks from '../sidebar/NavigationPrimaryLinks';
import NavigationSubReddits from '../sidebar/NavigationSubreddits';
import SearchRedditNames from '../sidebar/SearchRedditNames';
import NavigationAccount from '../sidebar/NavigationAccount';
import '../../styles/sidebar.scss';

interface NavigationProps {
  redditBearer: {
    bearer?: string;
    status?: string;
    loginURL?: string;
  };
  subredditsFilter: SubredditsFilterState;
}

function Navigation({ redditBearer, subredditsFilter }: NavigationProps) {
  const closeMenuIfOpen = useCallback(() => {
    if (document.body.classList.contains('show-menu')) {
      document.body.classList.remove('show-menu');
    }
  }, []);

  useEffect(() => {
    const menuOverlay = document.getElementById('menu-overlay');
    if (menuOverlay) {
      menuOverlay.addEventListener('click', closeMenuIfOpen);
      return () => {
        menuOverlay.removeEventListener('click', closeMenuIfOpen);
      };
    }
  }, [closeMenuIfOpen]);

  const { filterText, active } = subredditsFilter;
  const hideExtras = !isEmpty(filterText) || active;
  const loggedIn = redditBearer.status === 'auth' || false;

  // Hiding the components with CSS is significantly faster than destroying and re-rendering.
  return (
    <div className="w-100">
      <div style={hideExtras ? { display: 'none' } : {}}>
        <NavigationPrimaryLinks />
        {loggedIn && <NavigationAccount />}
        <div className="nav-divider" />
        {loggedIn && <MultiReddits />}
        <div className="nav-divider" />
      </div>
      <NavigationSubReddits />
      <SearchRedditNames filterText={filterText} />
      <div className="my-5 py-3 bottom-spacer" />
    </div>
  );
}

export default Navigation;
