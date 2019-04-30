import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { listingsFetchRedditNew } from '../../redux/actions/listings';

const Reload = ({ getNewRedditEntries, listingsStatus, stream }) => {
  const loading = listingsStatus !== 'loaded' && listingsStatus !== 'loadedAll';
  const iconClass = `fas fa-sync-alt${loading ? ' fa-spin' : ''}`;
  const btnClass = stream
    ? 'btn btn-primary btn-sm'
    : 'btn btn-secondary btn-sm';

  const refresh = async () => {
    window.scrollTo(0, 0);
    await getNewRedditEntries();
  };

  return (
    <button
      type="button"
      className={btnClass}
      title="Load New Entries"
      onClick={refresh}
      disabled={loading}
    >
      <i className={iconClass} />
    </button>
  );
};

Reload.propTypes = {
  getNewRedditEntries: PropTypes.func.isRequired,
  listingsStatus: PropTypes.string.isRequired,
  stream: PropTypes.bool,
};

Reload.defaultProps = {
  stream: false,
};

const mapStateToProps = state => ({
  listingsStatus: state.listingsRedditStatus,
  stream: state.siteSettings.stream,
});

export default connect(
  mapStateToProps,
  {
    getNewRedditEntries: listingsFetchRedditNew,
  }
)(Reload);
