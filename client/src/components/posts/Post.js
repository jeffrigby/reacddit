import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Content from './Content';
import PostVote from './PostVote';
import PostSave from './PostSave';
import RenderContent from './embeds';
import {
  redditSave,
  redditUnsave,
  redditVote,
} from '../../redux/actions/reddit';
import PostFooter from './PostFooter';

const classNames = require('classnames');

class Post extends React.PureComponent {
  mounted = false;

  state = {
    renderedContent: {},
    viewSetting: this.props.siteSettings.view,
    expand: this.props.siteSettings.view === 'expanded' || false,
  };

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

  static getDerivedStateFromProps(props, state) {
    const { entry, siteSettings } = props;
    if (siteSettings.view === state.viewSetting) {
      return null;
    }

    if (!entry.data.stickied) {
      return {
        expand: siteSettings.view === 'expanded' || false,
        viewSetting: siteSettings.view,
      };
    }

    return {
      expand: !siteSettings.condenseSticky,
      viewSetting: siteSettings.view,
    };
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  toggleViewAction = () => {
    const { expand } = this.state;
    this.setState({ expand: !expand });
  };

  toggleView = event => {
    this.toggleViewAction();
    event.preventDefault();
  };

  voteUp = () => {
    const { entry, vote, bearer } = this.props;
    if (bearer.status !== 'auth') return;

    const { data } = entry;
    const dir = data.likes === true ? 0 : 1;
    vote(data.name, dir);
  };

  voteDown = () => {
    const { entry, vote, bearer } = this.props;
    if (bearer.status !== 'auth') return;

    const { data } = entry;
    const dir = data.likes === false ? 0 : -1;
    vote(data.name, dir);
  };

  save = () => {
    const { entry, save, unsave, bearer } = this.props;
    if (bearer.status !== 'auth') return;

    const { data } = entry;
    const { saved, name } = data;
    if (saved) {
      unsave(name);
    } else {
      save(name);
    }
  };

  gotoDuplicates = () => {
    const { entry, gotoLink } = this.props;
    const { data } = entry;
    if (!data.is_self) {
      const searchTo = `/duplicates/${data.id}`;
      gotoLink(searchTo);
    }
  };

  // @todo is there a way around pop up blockers?
  openReddit = () => {
    const { entry } = this.props;
    window.open(`https://www.reddit.com${entry.data.permalink}`, '_blank');
  };

  openLink = () => {
    const { entry } = this.props;
    window.open(entry.data.url, '_blank');
  };

  render() {
    const {
      entry,
      focused,
      visible,
      siteSettings,
      bearer,
      actionable,
    } = this.props;
    const { data } = entry;
    const { renderedContent, expand } = this.state;

    const classArray = classNames('entry', 'list-group-item', {
      focused,
      actionable,
      condensed: !expand,
    });

    const sticky = data.stickied || false;

    const content = expand && (
      <Content
        content={renderedContent}
        name={data.name}
        link={data.url}
        load={visible}
        key={data.id}
      />
    );

    const linkFlair = data.link_flair_text ? (
      <Link
        className="badge badge-dark mx-1"
        to={`/r/${data.subreddit}/search?q=flair:%22${data.link_flair_text}%22`}
      >
        {data.link_flair_text}
      </Link>
    ) : null;

    let searchLink = '';
    if (!data.is_self) {
      const searchTo = `/duplicates/${data.id}`;
      searchLink = (
        <div>
          <Link
            to={searchTo}
            title="Search for other posts linking to this link"
            className="btn btn-link btn-sm m-0 p-0"
          >
            <i className="fas fa-search" />
          </Link>
        </div>
      );
    }

    const viewIcon = expand
      ? 'fas fa-compress-arrows-alt'
      : 'fas fa-expand-arrows-alt';

    const viewTitle = expand ? 'Close this post (x)' : 'Open this post (x)';

    const expandContractButton = (
      <button
        onClick={this.toggleView}
        type="button"
        className="btn btn-link btn-sm m-0 p-0"
        title={viewTitle}
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
        </a>
        {linkFlair}
      </h6>
    ) : (
      <h6 className="p-0 m-0">
        <button
          onClick={this.toggleView}
          className="btn btn-link m-0 p-0 post-title"
          type="button"
        >
          {data.title}
        </button>
        {linkFlair}{' '}
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="list-group-item-heading"
          title="Open link in new tab"
        >
          <i className="fas fa-link direct-link" />
        </a>
      </h6>
    );

    const actions = visible && (
      <>
        <PostVote
          likes={data.likes}
          ups={data.ups}
          voteDown={this.voteDown}
          voteUp={this.voteUp}
          bearer={bearer}
        />
        <PostSave saved={data.saved} save={this.save} bearer={bearer} />
        {searchLink}
        <div>{expandContractButton}</div>
      </>
    );

    return (
      <div className={classArray} key={data.name} id={data.name}>
        <div className="entry-interior">
          <header className="d-flex">
            {title}
            <div className="text-nowrap d-flex actions ml-auto">{actions}</div>
          </header>
          {content}
          <PostFooter
            entry={entry}
            debug={siteSettings.debug}
            sticky={sticky}
            visible={visible}
            renderedContent={renderedContent}
          />
        </div>
      </div>
    );
  }
}

Post.propTypes = {
  entry: PropTypes.object.isRequired,
  focused: PropTypes.bool.isRequired,
  actionable: PropTypes.bool.isRequired,
  siteSettings: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  vote: PropTypes.func.isRequired,
  unsave: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
  gotoLink: PropTypes.func.isRequired,
};

Post.defaultProps = {};

const mapStateToProps = state => ({
  siteSettings: state.siteSettings,
  bearer: state.redditBearer,
});

export default connect(
  mapStateToProps,
  {
    vote: redditVote,
    save: redditSave,
    unsave: redditUnsave,
    gotoLink: push,
  },
  null,
  { forwardRef: true }
)(Post);
