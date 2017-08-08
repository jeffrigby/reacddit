import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import TimeAgo from '@jshimko/react-time-ago';
import Content from './Content';

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDebug: false,
    };
    this.showDebug = this.showDebug.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.listingFilter.sort !== nextProps.listingFilter.sort) {
      return true;
    }
    if (this.props.debug !== nextProps.debug) {
      return true;
    }
    if (this.props.listingFilter.sortTop !== nextProps.listingFilter.sortTop) {
      return true;
    }
    if (this.props.entry !== nextProps.entry) {
      return true;
    }
    if (this.props.focused !== nextProps.focused) {
      return true;
    }
    if (this.props.visible !== nextProps.visible) {
      return true;
    }
    if (this.state.showDebug !== nextState.showDebug) {
      return true;
    }
    return false;
  }

  showDebug(event) {
    this.setState({ showDebug: true });
    event.preventDefault();
  }

  render() {
    const entry = this.props.entry;
    const timeago = entry.created_raw * 1000;
    const subUrl = `/r/${entry.subreddit}`;
    const contentObj = typeof entry.content === 'object' ? entry.content : {};
    const classes = this.props.focused ? 'entry list-group-item focused' : 'entry list-group-item';
    const content = <Content content={contentObj} name={entry.name} load={this.props.visible} />;
    const authorFlair = entry.author_flair_text ? <span className="badge">{entry.author_flair_text}</span> : null;
    const linkFlair = entry.link_flair_text ? <span className="label label-default">{entry.link_flair_text}</span> : null;
    const debug = process.env.NODE_ENV === 'development' && this.props.debug;
    return (
      <div className={classes} key={entry.url_id} id={entry.name}>
        <div className="entry-interior">
          <h4 className="title list-group-item-heading"><a href={entry.url} target="_blank" rel="noopener noreferrer" className="list-group-item-heading">{entry.title}</a> {linkFlair}</h4>
          <div className="vote">
            <button type="button" className="btn btn-link btn-sm"><span className="glyphicon glyphicon-thumbs-up" aria-hidden="true" /> {entry.ups}</button>
            <button type="button" className="btn btn-link btn-sm"><span className="glyphicon glyphicon-thumbs-down" aria-hidden="true" /></button>
          </div>
          {content}
          <div className="meta-container clearfix">
            <small className="meta">
              <span className="date-author meta-sub">
                  Submitted <TimeAgo date={timeago} /> by <span className="author"> <Link to={`/user/${entry.author}/submitted/new`}>{entry.author}</Link> {authorFlair}</span> to
                <span className="subreddit meta-sub"><Link to={subUrl}>/r/{entry.subreddit}</Link></span>
              </span>
              <span className="source meta-sub">{entry.domain}</span>
              <span className="comments meta-sub">
                <a href={`https://www.reddit.com/${entry.permalink}`} rel="noopener noreferrer" target="_blank">
                comments <span className="badge">{entry.num_comments}</span>
                </a>
              </span>
              {debug && (
                <span>
                  <a href="#showDebug" onClick={this.showDebug}>Show Debug</a>
                </span>
              )}
            </small>
          </div>
          {this.state.showDebug && (
            <div className="debug"><pre>{JSON.stringify(entry, null, '\t')}</pre></div>
          )}
        </div>
      </div>
    );
  }
}

// Entry.propTypes = {
//   entry: PropTypes.object,
//   debug: PropTypes.bool,
//   sort: PropTypes.string,
//   sortTop: PropTypes.string,
//   loaded: PropTypes.bool,
//   focused: PropTypes.bool
// };
//
// module.exports = Entry;

Entry.propTypes = {
  entry: PropTypes.object.isRequired,
  listingFilter: PropTypes.object.isRequired,
  // listingsFocus: PropTypes.string.isRequired,
  debug: PropTypes.bool.isRequired,
  focused: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired,
  // listingEntries: PropTypes.object.isRequired,
  // push: PropTypes.func.isRequired,
  // authInfo: PropTypes.object,
};

Entry.defaultProps = {
  authInfo: {},
  // listingsFocus: null,
};

const mapStateToProps = state => ({
  listingFilter: state.listingsFilter,
  // listingsFocus: state.listingsFocus,
  debug: state.debugMode,
  // authInfo: state.authInfo,
});

const mapDispatchToProps = dispatch => ({
  // push: url => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Entry);
