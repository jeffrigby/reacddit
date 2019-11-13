import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { listingStatus } from '../../../redux/selectors/listingsSelector';

const PostsFooter = ({ status }) => {
  let footerStatus = '';
  if (status === 'loadingNext') {
    footerStatus = (
      <div className="alert alert-info" id="content-more-loading" role="alert">
        <i className="fas fa-spinner fa-spin" /> Getting more entries.
      </div>
    );
  } else if (status === 'loadedAll') {
    footerStatus = (
      <div className="alert alert-warning" id="content-end" role="alert">
        <i className="fas fa-exclamation-triangle" /> That&apos;s it!
      </div>
    );
  }

  return <div className="footer-status p-2">{footerStatus}</div>;
};

PostsFooter.propTypes = {
  status: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  status: listingStatus(state),
});

export default React.memo(connect(mapStateToProps, {})(PostsFooter));
