import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { siteSettings } from '../../redux/actions/misc';

const AutoRefresh = ({ setSiteSetting, stream }) => {
  const btnClass = stream
    ? 'btn btn-primary btn-sm'
    : 'btn btn-secondary btn-sm';

  const autoRefreshToggle = () => {
    window.scrollTo(0, 0);
    setSiteSetting({ stream: !stream });
  };

  return (
    <div className="auto-refresh">
      <button
        type="button"
        className={btnClass}
        title="Load New Entries"
        onClick={autoRefreshToggle}
      >
        <i className="fas fa-sync-alt" /> Auto Refresh
      </button>
      <div>
        <button
          type="button"
          className="btn btn-link p-0"
          data-toggle="modal"
          data-target="#autoRefresh"
          title="Auto Refresh Info"
        >
          What is this?
        </button>
      </div>
      <div
        className="modal fade"
        id="autoRefresh"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="autoRefreshed"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-sm">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Auto Refresh
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              Press this button to enable auto refresh. When enabled, new
              entries will automatically be loaded when scrolled to the top of
              the page. This can get crazy if you&rsquo;re on the front page and
              sorted by &lsquo;new&rsquo;.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AutoRefresh.propTypes = {
  stream: PropTypes.bool,
  setSiteSetting: PropTypes.func.isRequired,
};

AutoRefresh.defaultProps = {
  stream: false,
};

const mapStateToProps = state => ({
  stream: state.siteSettings.stream,
});

export default connect(
  mapStateToProps,
  {
    setSiteSetting: siteSettings,
  }
)(AutoRefresh);
