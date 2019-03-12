import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Content from './Content';
import PostVote from './PostVote';
import PostSave from './PostSave';
import PostDebug from './PostDebug';
import PostByline from './PostByline';
import RenderContent from './embeds';

const queryString = require('query-string');

class Post extends React.Component {
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
    this.toggleView = this.toggleView.bind(this);
  }

  componentDidMount() {
    this.mounted = true;
    const { entry } = this.props;

    if (entry.data.stickied) {
      this.setState({ expand: false });
    }

    const getContent = entry.data.crosspost_parent
      ? RenderContent(entry.data.crosspost_parent_list[0])
      : RenderContent(entry.data);

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

  toggleView(event) {
    const { expand } = this.state;
    if (expand) {
      this.setState({ expand: false });
    } else {
      this.setState({ expand: true });
    }
    event.preventDefault();
  }

  render() {
    const { entry, focused, visible, siteSettings } = this.props;
    const { data } = entry;
    const { showDebug, renderedContent, expand } = this.state;

    const classArray = ['entry', 'list-group-item'];
    if (focused) {
      classArray.push('focused');
    }

    if (!expand) {
      classArray.push('condensed');
    }

    const sticky = data.stickied || false;

    const content = expand && (
      <Content
        content={renderedContent}
        name={data.name}
        load={visible}
        key={data.id}
      />
    );

    const linkFlair = data.link_flair_text ? (
      <span className="badge badge-dark">{data.link_flair_text}</span>
    ) : null;
    const currentDebug =
      process.env.NODE_ENV === 'development' && siteSettings.debug;

    const crossPost = data.crosspost_parent || false;

    let searchLink = '';
    if (!data.is_self) {
      const query = queryString.stringify({
        q: `url:${data.url}`,
        sort: 'relevance',
      });
      const searchTo = `/search?${query}`;
      searchLink = (
        <div>
          <Link
            to={searchTo}
            title="Search for other posts linking to this link"
          >
            <i className="fas fa-search small" />
          </Link>
        </div>
      );
    }

    const viewIcon = expand
      ? 'fas fa-compress-arrows-alt'
      : 'fas fa-expand-arrows-alt';
    const expandContractButton = (
      <button
        onClick={this.toggleView}
        type="button"
        className="btn btn-link btn-sm m-0 p-0"
        title="Compress this post"
      >
        <i className={viewIcon} />
      </button>
    );

    const title = expand ? (
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
    ) : (
      <>
        <button
          onClick={this.toggleView}
          className="btn btn-link btn-sm m-0 p-0 post-title"
          type="button"
        >
          <h6 className="p-0 m-0">{data.title}</h6>
        </button>
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="list-group-item-heading"
          title="Open link in new tab"
        >
          {' '}
          <i className="fas fa-link direct-link" />
        </a>
      </>
    );

    return (
      <div className={classArray.join(' ')} key={data.name} id={data.name}>
        <div className="entry-interior">
          <header className="d-flex">
            {title}
            <div className="text-nowrap d-flex actions ml-auto">
              <PostVote id={data.id} likes={data.likes} ups={data.ups} />
              <PostSave name={data.name} saved={data.saved} />
              {searchLink}
              <div>{expandContractButton}</div>
            </div>
          </header>
          {content}
          <footer className="d-flex clearfix align-middle">
            <div className="mr-auto">
              <PostByline data={data} />
              {crossPost && (
                <>
                  <i className="fas fa-exchange-alt px-2" title="Crossposted" />{' '}
                  <PostByline data={data.crosspost_parent_list[0]} />
                </>
              )}
              {sticky && (
                <i className="fas fa-sticky-note px-2" title="Sticky" />
              )}
            </div>
            <div>
              {currentDebug && (
                <span className="pl-3">
                  {data.name}
                  <button
                    className="btn btn-link m-0 p-0"
                    onClick={this.showDebug}
                    title="Show debug"
                    type="button"
                  >
                    <i className="fas fa-code" />
                  </button>
                </span>
              )}
              {!data.is_self && data.domain}
            </div>
          </footer>
          {showDebug && currentDebug && (
            <PostDebug renderedContent={renderedContent} entry={entry} />
          )}
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  entry: PropTypes.object.isRequired,
  focused: PropTypes.bool.isRequired,
  listingFilter: PropTypes.object.isRequired,
  siteSettings: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
};

Post.defaultProps = {};

const mapStateToProps = state => ({
  listingFilter: state.listingsFilter,
  siteSettings: state.siteSettings,
});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Post);
