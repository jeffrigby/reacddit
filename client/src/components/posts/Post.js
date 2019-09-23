import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Content from './Content';
import RenderContent from './embeds';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { PostsContextData, PostsContextActionable } from '../../contexts';
import PostDebug from './PostDebug';

const classNames = require('classnames');

class Post extends React.PureComponent {
  mounted = false;

  constructor(props) {
    // Required step: always call the parent class' constructor
    super(props);

    // Set the state directly. Use props if necessary.
    this.state = {
      renderedContent: null,
      viewSetting: props.siteSettings.view,
      expand: props.siteSettings.view === 'expanded' || false,
      showDebug: false,
    };
  }

  async componentDidMount() {
    this.mounted = true;
    const { entry } = this.props;
    const { renderedContent } = this.state;

    if (entry.data.stickied) {
      this.setState({ expand: false });
    }
    if (renderedContent) return;

    const getContent = entry.data.crosspost_parent
      ? await RenderContent(entry.data.crosspost_parent_list[0])
      : await RenderContent(entry.data);

    if (getContent.inline) {
      await getContent.inline.forEach(async (value, key) => {
        getContent.inline[key] = await value;
      });
    }

    this.setState({
      renderedContent: getContent,
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

  toggleShowDebug = () => {
    const { showDebug } = this.state;
    this.setState({
      showDebug: !showDebug,
    });
  };

  render() {
    const {
      entry,
      focused,
      visible,
      siteSettings,
      actionable,
      minHeight,
    } = this.props;
    const { data } = entry;
    const { renderedContent, expand, showDebug } = this.state;

    // if (!renderedContent) {
    //   return <></>;
    // }

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
          <PostsContextData.Provider value={data}>
            <PostsContextActionable.Provider value={actionable}>
              <PostHeader
                visible={visible}
                expand={expand}
                toggleView={this.toggleView}
              />
              {expand && (
                <Content
                  content={renderedContent}
                  load={visible}
                  key={data.id}
                />
              )}
              <PostFooter
                debug={siteSettings.debug}
                toggleShowDebug={this.toggleShowDebug}
                visible={visible}
              />
              {siteSettings.debug && showDebug && (
                <PostDebug renderedContent={renderedContent} />
              )}
            </PostsContextActionable.Provider>
          </PostsContextData.Provider>
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
  gotoLink: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
};

Post.defaultProps = {
  minHeight: 0,
};

const mapStateToProps = state => ({
  siteSettings: state.siteSettings,
});

export default connect(
  mapStateToProps,
  {
    gotoLink: push,
  },
  null,
  { forwardRef: true }
)(Post);
