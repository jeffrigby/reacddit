import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as moment from 'moment';
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
      expand: true,
    };
    this.showDebug = this.showDebug.bind(this);
    this.expand = this.expand.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const { entry } = this.props;

    if (entry.data.stickied) {
      this.setState({ expand: false });
    }

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
    const { showDebug, renderedContent, expandSticky, expand } = this.state;

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
      expandSticky !== nextState.expandSticky ||
      expand !== nextState.expand
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

  expand(event) {
    this.setState({ expand: true });
    event.preventDefault();
  }

  render() {
    const { entry, focused, visible, debug } = this.props;
    const { data } = entry;
    const { showDebug, renderedContent, expand } = this.state;
    const timeago = moment(data.created_utc * 1000).from();
    const subUrl = `/r/${data.subreddit}`;

    let classes = 'entry list-group-item';
    if (focused) {
      classes += ' focused';
    }

    const sticky = data.stickied || false;
    const commentCount = parseFloat(data.num_comments).toLocaleString('en');

    const content = (
      <Content
        content={renderedContent}
        name={data.name}
        load={visible}
        key={data.id}
      />
    );
    const authorFlair = data.author_flair_text ? (
      <span className="badge badge-dark">{data.author_flair_text}</span>
    ) : null;
    const linkFlair = data.link_flair_text ? (
      <span className="badge badge-dark">{data.link_flair_text}</span>
    ) : null;
    const currentDebug = process.env.NODE_ENV === 'development' && debug;

    if (!expand) {
      classes += ' collapsed';
      return (
        <div className={classes} key={data.name} id={data.name}>
          {sticky && <span className="label label-default">Sticky</span>}{' '}
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={this.expand}
          >
            {data.title}
          </a>
          <Link to={subUrl}>/r/{data.subreddit}</Link>
          {data.author}
          <i className="fas fa-comments" /> {data.num_comments}
          {timeago}
        </div>
      );
    }

    return (
      <div className={classes} key={data.name} id={data.name}>
        <div className="entry-interior">
          <h6 className="title list-group-item-heading">
            <a
              href={data.url}
              target="_blank"
              rel="noopener noreferrer"
              className="list-group-item-heading"
            >
              {data.title}
            </a>{' '}
            {linkFlair}
          </h6>
          {content}
          <footer className="d-flex clearfix align-middle">
            <div className="mr-auto">
              Submitted {timeago} by{' '}
              <Link to={`/user/${data.author}/submitted/new`}>
                {data.author}
              </Link>{' '}
              {authorFlair} to <Link to={subUrl}>/r/{data.subreddit}</Link>{' '}
              {data.domain}{' '}
              <a
                href={`https://www.reddit.com${data.permalink}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                comments{' '}
                <span className="badge badge-primary">{commentCount}</span>
              </a>{' '}
              {currentDebug && (
                <button
                  className="btn btn-link m-0 p-0"
                  onClick={this.showDebug}
                  title="Show debug"
                  type="button"
                >
                  <i className="fas fa-code" />
                </button>
              )}
            </div>
            <EntryVote id={data.id} likes={data.likes} ups={data.ups} />
            <EntrySave name={data.name} saved={data.saved} />
          </footer>
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
