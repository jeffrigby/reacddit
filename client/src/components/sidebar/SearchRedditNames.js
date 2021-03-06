import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NavigationGenericNavItem from './NavigationGenericNavItem';
import RedditAPI from '../../reddit/redditAPI';

const queryString = require('query-string');

const SearchRedditNames = ({ filterText, over18, auth, subreddits, sort }) => {
  const initShowSearchResuts = over18 !== undefined ? over18 : false;
  const [searchResults, setSearchResults] = useState([]);
  const [showNSFW, setShowNSFW] = useState(initShowSearchResuts);

  useEffect(() => {
    const getResults = async () => {
      if (filterText) {
        const results = await RedditAPI.searchRedditNames(filterText, {
          include_over_18: showNSFW,
        });
        const { names } = results;
        if (names.length === 0) {
          setSearchResults('');
        } else {
          setSearchResults(names);
        }
      } else {
        setSearchResults([]);
      }
    };

    getResults();
  }, [filterText, showNSFW]);

  if (!filterText || searchResults.length === 0) {
    return null;
  }

  // Filter out subscribed reddits
  const filteredSubs = [];
  searchResults.forEach(value => {
    if (subreddits.indexOf(value.toLowerCase()) === -1) {
      filteredSubs.push(value);
    }
  });

  let currentSort = sort || '';
  const query = queryString.parse(window.location.search);
  const { t } = query;

  switch (currentSort) {
    case 'top':
    case 'controversial':
      currentSort += `?t=${t}`;
      break;
    case 'relevance':
    case 'best':
    case 'comments':
      currentSort = '';
      break;
    default:
      break;
  }
  let navItems = [];
  if (filteredSubs.length > 0) {
    navItems = filteredSubs.map((value, idx) => {
      const key = `sr_search_${value}_${idx}`;
      const to = `/r/${value}/${currentSort}`;
      return (
        <NavigationGenericNavItem to={to} text={value} key={key} id={key} />
      );
    });
  }

  if (navItems.length === 0) {
    return null;
  }

  const toggleNSFW = () => {
    setShowNSFW(!showNSFW);
  };

  const nsfwText = showNSFW ? 'Hide NSFW' : 'Show NSFW';
  const nsfwButton = !auth ? (
    <div className="pt-1 small">
      <button
        type="button"
        className="btn btn-dark btn-sm m-0"
        onClick={toggleNSFW}
        title="Toggle NSFW Results"
      >
        {nsfwText}
      </button>
    </div>
  ) : null;

  return (
    <div id="sidebar-subreddits">
      <div className="sidebar-heading d-flex text-muted">
        <span className="mr-auto">Search</span>
      </div>
      <ul className="nav flex-column">{navItems}</ul>
      {nsfwButton}
    </div>
  );
};

SearchRedditNames.propTypes = {
  filterText: PropTypes.string,
  over18: PropTypes.bool,
  sort: PropTypes.string.isRequired,
  subreddits: PropTypes.array,
  auth: PropTypes.bool.isRequired,
};

SearchRedditNames.defaultProps = {
  filterText: '',
  subreddits: [],
  over18: false,
};

const mapStateToProps = state => ({
  over18: state.redditMe.me.over_18,
  subreddits:
    state.subreddits.subreddits !== undefined
      ? Object.keys(state.subreddits.subreddits)
      : [],
  sort: state.listingsFilter.sort,
  auth: state.redditBearer.status === 'auth' || false,
});

export default connect(mapStateToProps, {})(SearchRedditNames);
