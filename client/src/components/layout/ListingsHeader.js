import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import SubUnSub from '../header/SubUnSub';

const queryString = require('query-string');

const ListingsHeader = ({ about, filter }) => {
  const { listType, target, multi, user } = filter;
  // if (listType !== 's') return null;

  let title = '';
  let subInfo;
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
      } else if (target === 'mine') {
        title = (
          <>
            <span className="react">reac</span>
            <span className="reddit">ddit</span>: Home
          </>
        );
      } else {
        const subscribers = about.subscribers
          ? `${about.subscribers.toLocaleString()} Subcribers`
          : '';
        const online = about.active_user_count
          ? `${about.active_user_count.toLocaleString()} Online`
          : '';
        if (subscribers && online) {
          subInfo = `${subscribers} - ${online}`;
        }
        title = `/r/${target}`;
      }
      break;
    }
    case 'm':
      title = `/m/${target}`;
      break;
    case 's': {
      const qs = queryString.parse(window.location.search);
      searchEverywhere = target !== 'mine' && (
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
          <h5 className="m-0 p-0 w-100">
            {title} {searchEverywhere && <>- {searchEverywhere}</>}
          </h5>
        </div>
        <div className="listing-actions">
          {listType === 'r' && target !== 'mine' && <SubUnSub />}
        </div>
      </div>
      {subInfo && (
        <div>
          <small>{subInfo}</small>
        </div>
      )}
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
