import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import * as listings from '../redux/actions/listings';

const queryString = require('query-string');

class Entries extends React.Component {
  componentDidMount() {
    this.setRedux(this.props.match, this.props.location);
  }

  componentWillReceiveProps(nextProps) {
    this.setRedux(nextProps.match, nextProps.location);
  }

  shouldComponentUpdate(nextProps) {
    if (JSON.stringify(nextProps.listingsFilter) !== JSON.stringify(this.props.listingsFilter)) {
      return true;
    } else if (this.props.listingsStatus !== nextProps.listingsStatus) {
      return true;
    }
    return false;
  }

  componentDidUpdate(prevProps) {
    if (JSON.stringify(prevProps.listingsFilter) !== JSON.stringify(this.props.listingsFilter)) {
      this.props.getEntries(this.props.listingsFilter);
    }
  }

  setRedux(match, location) {
    const qs = queryString.parse(location.search);
    const sort = match.params.sort || 'hot';
    const sortTop = qs.t || 'day';
    const target = match.params.target || 'mine';
    const before = qs.before || '';
    const after = qs.after || '';
    const limit = qs.limit || '20';
    const userType = match.params.userType || '';
    let listType = match.params.listType || 'r';
    if (listType === 'user') listType = 'u';
    const url = this.getEntriesUrl();

    const listingsFilter = this.props.listingsFilter;
    const newListingsFilter = {
      listType,
      sort,
      sortTop,
      target,
      before,
      after,
      limit,
      userType,
      url,
    };

    if (JSON.stringify(listingsFilter) !== JSON.stringify(newListingsFilter)) {
      this.props.setFilter(newListingsFilter);
      // console.log('called');
      // this.props.getEntries(newListingsFilter, this.props.location.search);
    }
  }

  getEntriesUrl() {
    const qs = queryString.parse(location.search);
    const filter = this.props.listingsFilter;

    if (!filter.target || !filter.sort) {
      return null;
    }

    let url = '/json/';

    if (filter.listType === 'r') {
      url += `r/${filter.target}/${filter.sort}`;
    }

    if (filter.listType === 'u') {
      url += `user/${filter.target}/${filter.userType}`;
      if (filter.userType !== 'saved') {
        url += `/${filter.sort}`;
      }
    }

    if (!qs.limit) {
      qs.limit = '20';
    }

    const qsStr = `?${queryString.stringify(qs)}`;

    if (qsStr) {
      url += qsStr;
    }
    return url;
  }

  render() {
    const jsonUrl = this.getEntriesUrl();

    if (this.props.listingsStatus === 'unloaded' || this.props.listingsStatus === 'loading') {
      return (
        <div className="alert alert-info" id="content-loading" role="alert">
          <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate" /> Getting entries from Reddit.
        </div>
      );
    }

    if (this.props.listingsStatus === 'error') {
      return (
        <div className="alert alert-danger" id="subreddits-load-error" role="alert">
          <span className="glyphicon glyphicon glyphicon-alert" /> Error loading this subreddit.
        </div>
      );
    }

    // let entries = '';
    // const entriesObject = this.props.entries;
    // const entriesKeys = Object.keys(entriesObject);
    // let lastKey;
    // if (entriesKeys.length > 0) {
    //   entries = Object.keys(this.state.entries).map((key) => {
    //     entriesObject[key].lastID = lastKey ? lastKey : null;
    //     lastKey = key;
    //     return (
    //       <Entry
    //         entry={entriesObject[key]}
    //         key={entriesObject[key].id}
    //         debug={this.state.debug}
    //         sort={this.state.sort}
    //         sortTop={this.state.sortTop}
    //         loaded={entriesObject[key].loaded}
    //         focused={entriesObject[key].focused}
    //       />
    //     );
    //   });
    // } else {
    //   if (this.state.loading !== 1) {
    //     entries = (<div className="alert alert-warning" id="content-empty" role="alert">Can't find anything here.</div>);
    //   }
    // }

    // const target = this.props.listingsTarget === 'mine' ? 'RedditJS' : this.props.listingsTarget;
    return (
      <div>
        Target: {this.props.listingsFilter.target}<br />
        Sort: {this.props.listingsFilter.sort}<br />
        SortTop: {this.props.listingsFilter.sortTop}<br />
        Type: {this.props.listingsFilter.listType}<br />
        URL: {jsonUrl}<br />
      </div>
    );
  }
}

Entries.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  location: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  setFilter: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  getEntries: PropTypes.func.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsEntries: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  entries: PropTypes.object, // eslint-disable-line react/no-unused-prop-types
  listingsFilter: PropTypes.object.isRequired, // eslint-disable-line react/no-unused-prop-types
  listingsStatus: PropTypes.string.isRequired, // eslint-disable-line react/no-unused-prop-types
};

Entries.defaultProps = {
  entries: {},
};

const mapStateToProps = (state, ownProps) => ({
  listingsFilter: state.listingsFilter,
  listingsEntries: state.listingsEntries,
  listingsStatus: state.listingsStatus,
  entries: state.listingsEntries.entries,
});

const mapDispatchToProps = dispatch => ({
  setFilter: filter => dispatch(listings.listingsFilter(filter)),
  getEntries: (filter, query) => dispatch(listings.listingsFetch(filter, query)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Entries);
