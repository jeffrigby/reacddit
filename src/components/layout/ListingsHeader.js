import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import SubUnSub from '../header/SubUnSub';

const queryString = require('query-string');

const ListingsHeader = ({ about, filter }) => {
  const { listType, target, multi, user } = filter;
  if (target === 'mine' && listType !== 's') return null;

  let title = '';
  let searchEverywhere;
  switch (listType) {
    case 'u':
      title = `/u/${user} ${target}`;
      break;
    case 'r': {
      if (target === 'friends') {
        title = 'My Friends';
      } else if (target === 'popular') {
        title = 'Popular Posts';
      } else {
        const subscribers = about.subscribers
          ? ` - ${about.subscribers.toLocaleString()} Subcribers`
          : '';
        const online = about.active_user_count
          ? ` - ${about.active_user_count.toLocaleString()} Online`
          : '';
        title = `/r/${target} ${subscribers} ${online}`;
      }
      break;
    }
    case 'm':
      title = `/m/${target}`;
      break;
    case 's': {
      const qs = queryString.parse(window.location.search);
      searchEverywhere = (
        <NavLink to={`/search?q=${qs.q}`}>Search Everywhere</NavLink>
      );
      title = `Results for '${qs.q}'`;
      if (multi) {
        title += ` in /m/${target}`;
      } else if (target !== 'mine') {
        title += ` in /r/${target}`;
      }
      break;
    }
    default:
      title = '';
      break;
  }

  return (
    <div className="list-group-item listings-header">
      <div className="d-flex">
        <div className="mr-auto">
          <h6 className="m-0 p-0 w-100">
            {title} {searchEverywhere && <>- {searchEverywhere}</>}
          </h6>
        </div>
        {listType === 'r' && (
          <div>
            <SubUnSub />
          </div>
        )}
      </div>
      {about.public_description && (
        <div>
          <small>{about.public_description}</small>
        </div>
      )}
    </div>
  );
};

ListingsHeader.propTypes = {
  about: PropTypes.object,
  filter: PropTypes.object.isRequired,
};

ListingsHeader.defaultProps = {
  about: {},
};

const mapStateToProps = state => ({
  about: state.currentSubreddit,
  filter: state.listingsFilter,
});

export default connect(
  mapStateToProps,
  {}
)(ListingsHeader);
