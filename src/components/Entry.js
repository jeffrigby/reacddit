import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import TimeAgo from '@jshimko/react-time-ago';
import Content from './Content';
import EntryVote from './EntryVote';
import EntrySave from './EntrySave';
import RenderContent from '../embeds';

const ReactJson = React.lazy(() => import('react-json-view'));

class Entry extends React.Component {
  mounted = false;

  constructor(props) {
    super(props);
    this.state = {
      showDebug: false,
      renderedContent: {},
      expandSticky: false,
    };
    this.showDebug = this.showDebug.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const { entry } = this.props;
    const getContent = RenderContent(entry.data);

    Promise.resolve(getContent).then(content => {
      if (this.mounted) {
        let contentObj = { ...content };
        contentObj.js = true;
        if (!contentObj.type) {
          contentObj = typeof entry.content === 'object' ? entry.content : {};
          contentObj.js = false;
        }
        this.setState({
          renderedContent: contentObj,
        });
      }
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { ...props } = this.props;
    const { showDebug, renderedContent, expandSticky } = this.state;

    if (props.listingFilter.sort !== nextProps.listingFilter.sort) {
      return true;
    }
    if (props.debug !== nextProps.debug) {
      return true;
    }
    if (props.listingFilter.t !== nextProps.listingFilter.t) {
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
    if (
      showDebug !== nextState.showDebug ||
      expandSticky !== nextState.expandSticky
    ) {
      return true;
    }
    if (renderedContent !== nextState.renderedContent) {
      return true;
    }
    return false;
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  showDebug(event) {
    this.setState({ showDebug: true });
    event.preventDefault();
  }

  render() {
    const { entry, focused, visible, debug } = this.props;
    const { showDebug, renderedContent, expandSticky } = this.state;
    const timeago = entry.data.created_utc * 1000;
    const subUrl = `/r/${entry.data.subreddit}`;
    let classes = 'entry list-group-item';
    if (focused) {
      classes += ' focused';
    }

    if (entry.data.stickied && expandSticky) {
      classes += ' showSticky';
    } else if (entry.data.stickied && !expandSticky) {
      classes += ' hideSticky';
    }

    const content = (
      <Content
        content={renderedContent}
        name={entry.data.name}
        load={visible}
        key={entry.data.id}
      />
    );
    const jsRender = renderedContent.js ? 'JS' : 'PHP';
    const authorFlair = entry.data.author_flair_text ? (
      <span className="badge">{entry.data.author_flair_text}</span>
    ) : null;
    const linkFlair = entry.data.link_flair_text ? (
      <span className="label label-default">{entry.data.link_flair_text}</span>
    ) : null;
    const currentDebug = process.env.NODE_ENV === 'development' && debug;
    return (
      <div className={classes} key={entry.data.name} id={entry.data.name}>
        <div className="entry-interior">
          <h4 className="title list-group-item-heading">
            <a
              href={entry.data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="list-group-item-heading"
            >
              {entry.data.title}
            </a>{' '}
            {linkFlair}
          </h4>
          <EntryVote
            id={entry.data.id}
            likes={entry.data.likes}
            ups={entry.data.ups}
          />
          {content}
          <div className="meta-container clearfix">
            <small className="meta">
              <span className="date-author meta-sub">
                Submitted <TimeAgo date={timeago} /> by{' '}
                <span className="author">
                  {' '}
                  <Link to={`/user/${entry.data.author}/submitted/new`}>
                    {entry.data.author}
                  </Link>{' '}
                  {authorFlair}
                </span>{' '}
                to
                <span className="subreddit meta-sub">
                  <Link to={subUrl}>/r/{entry.data.subreddit}</Link>
                </span>
              </span>
              <span className="source meta-sub">{entry.data.domain}</span>
              <span className="comments meta-sub">
                <a
                  href={`https://www.reddit.com${entry.data.permalink}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  comments{' '}
                  <span className="badge">{entry.data.num_comments}</span>
                </a>
              </span>
              <span className="save meta-sub">
                <EntrySave name={entry.data.name} saved={entry.data.saved} />
              </span>
              {currentDebug && (
                <span className="debug meta-sub">
                  <a href="#showDebug" onClick={this.showDebug}>
                    Show Debug
                  </a>{' '}
                  {jsRender}
                </span>
              )}
            </small>
          </div>
          {showDebug && (
            <div className="debug">
              <Suspense fallback={<div>Loading JSON...</div>}>
                <ReactJson
                  src={renderedContent}
                  name="content"
                  theme="harmonic"
                  sortKeys
                  collapsed
                />
                <ReactJson
                  src={entry}
                  name="entry"
                  theme="harmonic"
                  sortKeys
                  collapsed
                />
              </Suspense>
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
