import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import MultiReddits from '../sidebar/MultiReddits';
import NavigationPrimaryLinks from '../sidebar/NavigationPrimaryLinks';
import NavigationSubReddits from '../sidebar/NavigationSubreddits';
import SearchRedditNames from '../sidebar/SearchRedditNames';
import '../../styles/sidebar.scss';

const Navigation = ({ redditBearer, subredditsFilter }) => {
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
      document
        .getElementById('menu-overlay')
        .removeEventListener('click', closeMenuIfOpen);
    };
  });

  const { filterText } = subredditsFilter;
  const hideExtras = !isEmpty(filterText);
  const loggedIn = redditBearer.status === 'auth' || false;

  return (
    <div className="w-100">
      {!hideExtras && <NavigationPrimaryLinks />}
      {!hideExtras && <div className="nav-divider" />}
      {loggedIn && !hideExtras && <MultiReddits />}
      <NavigationSubReddits />
      <SearchRedditNames filterText={filterText} />
    </div>
  );
};

Navigation.propTypes = {
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

export default Navigation;
