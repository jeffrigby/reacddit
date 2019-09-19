import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Content from './Content';
import RenderContent from './embeds';
import {
  redditSave,
  redditUnsave,
  redditVote,
} from '../../redux/actions/reddit';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';

const classNames = require('classnames');

class Post extends React.PureComponent {
  mounted = false;

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      renderedContent: {},
      viewSetting: props.siteSettings.view,
      expand: props.siteSettings.view === 'expanded' || false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    const { entry } = this.props;

    if (entry.data.stickied) {
      this.setState({ expand: false });
    }
  }

  async componentDidUpdate(prevProps) {
    const { entry } = this.props;
    const { renderedContent } = this.state;
    if (Object.keys(renderedContent).length !== 0) return;

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

  // Actions are kept here so I can call them with key commands
  // @todo figure out how to put them with the actions component.
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
      minHeight,
    } = this.props;
    const { data } = entry;
    const { renderedContent, expand } = this.state;

    const classArray = classNames('entry', 'list-group-item', {
      focused,
      visible,
      actionable,
      condensed: !expand,
    });

    const styles = {};
    if (!visible && minHeight) {
      styles.minHeight = minHeight;
    }

    return (
      <div className={classArray} key={data.name} id={data.name} style={styles}>
        <div className="entry-interior">
          <PostHeader
            entry={entry}
            save={this.save}
            visible={visible}
            voteDown={this.voteDown}
            expand={expand}
            toggleView={this.toggleView}
            voteUp={this.voteUp}
            bearer={bearer}
          />
          {expand && (
            <Content
              content={renderedContent}
              data={data}
              load={visible}
              key={data.id}
            />
          )}
          <PostFooter
            entry={entry}
            debug={siteSettings.debug}
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
  minHeight: PropTypes.number,
};

Post.defaultProps = {
  minHeight: 0,
};

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
