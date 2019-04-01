import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import RedditAPI from '../../reddit/redditAPI';

const SearchRedditNames = ({ filterText }) => {
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    const getResults = async search => {
      if (search) {
        const results = await RedditAPI.searchRedditNames(search);
        setSearchResults(results.names);
      } else {
        setSearchResults([]);
      }
    };

    getResults(filterText);
  }, [filterText]);

  if (!filterText) {
    return null;
  }

  let navItems = [];
  if (searchResults.length > 0) {
    navItems = searchResults.map(value => {
      const key = `sr_search_${value}`;
      return (
        <NavigationGenericNavItem
          to={`/r/${value}`}
          text={value}
          key={key}
          id={key}
        />
      );
    });
  }

  if (navItems.length === 0) {
    return null;
  }

  return (
    <div id="sidebar-subreddits">
      <div className="sidebar-heading d-flex text-muted">
        <span className="mr-auto">Search</span>
      </div>
      {navItems && <ul className="nav flex-column">{navItems}</ul>}
    </div>
  );
};

SearchRedditNames.propTypes = {
  filterText: PropTypes.string,
};

SearchRedditNames.defaultProps = {
  filterText: '',
};

export default SearchRedditNames;
