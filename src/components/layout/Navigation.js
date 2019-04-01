import React from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import MultiReddits from '../sidebar/MultiReddits';
import NavigationPrimaryLinks from '../sidebar/NavigationPrimaryLinks';
import NavigationSubReddits from '../sidebar/NavigationSubreddits';
import '../../styles/sidebar.scss';
import SearchRedditNames from '../sidebar/SearchRedditNames';

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
      <SearchRedditNames filterText={filterText} />
    </div>
  );
};

Navigation.propTypes = {
  redditBearer: PropTypes.object.isRequired,
  subredditsFilter: PropTypes.object.isRequired,
};

export default Navigation;
