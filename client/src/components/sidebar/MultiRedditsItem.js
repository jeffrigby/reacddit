import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _trimEnd from 'lodash/trimEnd';
import { setMenuStatus, getMenuStatus } from '../../common';
import MultiRedditsSubs from './MultiRedditsSubs';
import NavigationGenericNavItem from './NavigationGenericNavItem';

const queryString = require('query-string');

const MultiRedditsItem = ({ item, sort, location }) => {
  const { path } = item.data;
  const [showSubs, setShowSubs] = useState(getMenuStatus(path));

  const hideShowSubs = () => {
    setMenuStatus(path, !showSubs);
    setShowSubs(!showSubs);
  };

  const search = queryString.parse(location.search);

  // Generate Link
  let currentSort = sort || '';
  if (currentSort.match(/^(top|controversial)$/) && search.t) {
    currentSort = `${currentSort}?t=${search.t}`;
  } else if (currentSort === 'relevance' || currentSort === 'best') {
    currentSort = '';
  }

  const navTo = `/me/m/${item.data.name}/${currentSort}`;

  const arrowClass = showSubs ? 'down' : 'left';

  return (
    <li key={item.data.path} className="nav-item has-child m-0 p-0">
      <div className="d-flex align-middle">
        <span className="mr-auto">
          <NavigationGenericNavItem
            to={_trimEnd(navTo, '/')}
            text={item.data.name}
            title={item.data.description_md}
            noLi
          />
        </span>
        <span>
          <button
            className="btn btn-link btn-sm m-0 p-0 pl-2 border-0"
            onClick={hideShowSubs}
            type="button"
          >
            <i className={`fas fa-caret-${arrowClass} menu-caret`} />
          </button>
        </span>
      </div>
      {showSubs && <MultiRedditsSubs multiRedditSubs={item.data.subreddits} />}
    </li>
  );
};

MultiRedditsItem.propTypes = {
  item: PropTypes.object.isRequired,
  sort: PropTypes.string.isRequired,
  location: PropTypes.object.isRequired,
};

MultiRedditsItem.defaultProps = {};

const mapStateToProps = (state) => ({
  sort: state.listingsFilter.sort,
  location: state.router.location,
});

export default connect(mapStateToProps, null)(React.memo(MultiRedditsItem));
