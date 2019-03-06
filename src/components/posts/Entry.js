import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import * as moment from 'moment';
import Content from './Content';
import EntryVote from './EntryVote';
import EntrySave from './EntrySave';
import RenderContent from './embeds';

const ReactJson = React.lazy(() => import('react-json-view'));

class Entry extends React.Component {
  mounted = false;

  constructor(props) {
    super(props);
    this.state = {
      showDebug: false,
      renderedContent: {},
      condenseSticky: props.siteSettings.condenseSticky,
      expand: props.siteSettings.view === 'expanded' || false,
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

  componentWillReceiveProps(nextProps) {
    const { entry, siteSettings } = this.props;
    if (siteSettings.view !== nextProps.siteSettings.view) {
      if (!entry.data.stickied) {
        this.setState({
          expand: nextProps.siteSettings.view === 'expanded' || false,
        });
      } else {
        this.setState({
          expand: !nextProps.siteSettings.condenseSticky,
        });
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { ...props } = this.props;
    const { showDebug, renderedContent, condenseSticky, expand } = this.state;

    if (props.listingFilter.sort !== nextProps.listingFilter.sort) {
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
    if (props.siteSettings.view !== nextProps.siteSettings.view) {
      return true;
    }
    if (props.siteSettings.debug !== nextProps.siteSettings.debug) {
      return true;
    }
    if (
      showDebug !== nextState.showDebug ||
      condenseSticky !== nextState.condenseSticky ||
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
    const { entry, focused, visible, siteSettings } = this.props;
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
    const currentDebug =
      process.env.NODE_ENV === 'development' && siteSettings.debug;

    if (!expand) {
      classes += ' collapsed d-flex';
      // gotta be a better way to do this, but, whatever, sticking with timeago for now.
      const timeagoshort = timeago
        .replace(' ago', '')
        .replace(/^a|^an/, '1')
        .replace(/seconds?/g, 'S')
        .replace(/minutes?/g, 'M')
        .replace(/hours?/g, 'H')
        .replace(/days?/g, 'D')
        .replace(/months?/g, 'M')
        .replace(/years?/g, 'Y')
        .replace(' ', '');
      return (
        <div
          className={classes}
          key={data.name}
          id={data.name}
          onClick={this.expand}
        >
          <div className="">
            {sticky && <i className="fas fa-sticky-note" />}
          </div>
          <div className="px-2">
            <div className="text-nowrap px-2 text-truncate font-weight-bold">
              {data.title}
            </div>
            <div />
          </div>
          <div className="ml-auto text-nowrap">{timeagoshort}</div>
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
                <span className="pl-3">
                  <button
                    className="btn btn-link m-0 p-0"
                    onClick={this.showDebug}
                    title="Show debug"
                    type="button"
                  >
                    <i className="fas fa-code" />
                  </button>{' '}
                  {data.name}
                </span>
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
  focused: PropTypes.bool.isRequired,
  listingFilter: PropTypes.object.isRequired,
  siteSettings: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
};

Entry.defaultProps = {};

const mapStateToProps = state => ({
  listingFilter: state.listingsFilter,
  siteSettings: state.siteSettings,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Entry);
