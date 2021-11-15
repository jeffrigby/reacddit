import { useEffect } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import MultiReddits from '../sidebar/MultiReddits';
import NavigationPrimaryLinks from '../sidebar/NavigationPrimaryLinks';
import NavigationSubReddits from '../sidebar/NavigationSubreddits';
import SearchRedditNames from '../sidebar/SearchRedditNames';
import '../../styles/sidebar.scss';
import NavigationAccount from '../sidebar/NavigationAccount';

function Navigation({ redditBearer, subredditsFilter }) {
  const closeMenuIfOpen = () => {
    if (document.body.classList.contains('show-menu')) {
      document.body.classList.remove('show-menu');
    }
  };

  useEffect(() => {
    document
      .getElementById('menu-overlay')
      .addEventListener('click', closeMenuIfOpen);
    return () => {
      if (document.getElementById('menu-overlay')) {
        document
          .getElementById('menu-overlay')
          .removeEventListener('click', closeMenuIfOpen);
      }
    };
  }, []);

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

Navigation.propTypes = {
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

export default Navigation;
