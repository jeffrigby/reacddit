import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import TimeAgo from '@jshimko/react-time-ago';
import Content from './Content';
import EntryVote from './EntryVote';
import EntrySave from './EntrySave';

class Entry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDebug: false,
    };
    this.showDebug = this.showDebug.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { ...props } = this.props;
    const { showDebug } = this.state;

    if (props.listingFilter.sort !== nextProps.listingFilter.sort) {
      return true;
    }
    if (props.debug !== nextProps.debug) {
      return true;
    }
    if (props.listingFilter.sortTop !== nextProps.listingFilter.sortTop) {
      return true;
    }
    if (props.entry !== nextProps.entry) {
      return true;
    }
    if (props.focused !== nextProps.focused) {
      return true;
    }
    if (props.visible !== nextProps.visible) {
      return true;
    }
    if (showDebug !== nextState.showDebug) {
      return true;
    }
    return false;
  }

  showDebug(event) {
    this.setState({ showDebug: true });
    event.preventDefault();
  }

  render() {
    const { entry, focused, visible, debug } = this.props;
    const { showDebug } = this.state;
    const timeago = entry.created_raw * 1000;
    const subUrl = `/r/${entry.subreddit}`;
    const contentObj = typeof entry.content === 'object' ? entry.content : {};
    const classes = focused
      ? 'entry list-group-item focused'
      : 'entry list-group-item';
    const content = (
      <Content content={contentObj} name={entry.name} load={visible} />
    );
    const authorFlair = entry.author_flair_text ? (
      <span className="badge">{entry.author_flair_text}</span>
    ) : null;
    const linkFlair = entry.link_flair_text ? (
      <span className="label label-default">{entry.link_flair_text}</span>
    ) : null;
    const currentDebug = process.env.NODE_ENV === 'development' && debug;
    return (
      <div className={classes} key={entry.url_id} id={entry.name}>
        <div className="entry-interior">
          <h4 className="title list-group-item-heading">
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              className="list-group-item-heading"
            >
              {entry.title}
            </a>{' '}
            {linkFlair}
          </h4>
          <EntryVote id={entry.id} likes={entry.likes} ups={entry.ups} />
          {content}
          <div className="meta-container clearfix">
            <small className="meta">
              <span className="date-author meta-sub">
                Submitted <TimeAgo date={timeago} /> by{' '}
                <span className="author">
                  {' '}
                  <Link to={`/user/${entry.author}/submitted/new`}>
                    {entry.author}
                  </Link>{' '}
                  {authorFlair}
                </span>{' '}
                to
                <span className="subreddit meta-sub">
                  <Link to={subUrl}>/r/{entry.subreddit}</Link>
                </span>
              </span>
              <span className="source meta-sub">{entry.domain}</span>
              <span className="comments meta-sub">
                <a
                  href={`https://www.reddit.com/${entry.permalink}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  comments <span className="badge">{entry.num_comments}</span>
                </a>
              </span>
              <EntrySave name={entry.name} saved={entry.saved} />
              {currentDebug && (
                <span>
                  <a href="#showDebug" onClick={this.showDebug}>
                    Show Debug
                  </a>
                </span>
              )}
            </small>
          </div>
          {showDebug && (
            <div className="debug">
              <pre>{JSON.stringify(entry, null, '\t')}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }
}

Entry.propTypes = {
  entry: PropTypes.object.isRequired,
  listingFilter: PropTypes.object.isRequired,
  debug: PropTypes.bool.isRequired,
  focused: PropTypes.bool.isRequired,
  visible: PropTypes.bool.isRequired,
};

Entry.defaultProps = {};

const mapStateToProps = state => ({
  listingFilter: state.listingsFilter,
  debug: state.debugMode,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Entry);
