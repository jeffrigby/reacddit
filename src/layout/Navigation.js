import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash.isempty';
import MultiReddits from '../components/sidebarMenu/MultiReddits';
import NavigationPrimaryLinks from '../components/sidebarMenu/NavigationPrimaryLinks';
import '../styles/sidebar.scss';
import NavigationSubReddits from '../components/sidebarMenu/NavigationSubreddits';

const Navigation = ({ redditBearer, subredditsFilter }) => {
  const { filterText } = subredditsFilter;
  const hideExtras = !isEmpty(filterText);
  const loggedIn = redditBearer.status === 'auth' || false;

  return (
    <div className="w-100">
      {!hideExtras && <NavigationPrimaryLinks />}
      {!hideExtras && <div className="nav-divider" />}
      {loggedIn && !hideExtras && <MultiReddits />}
      <NavigationSubReddits />
    </div>
  );
};

Navigation.propTypes = {
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

export default Navigation;
