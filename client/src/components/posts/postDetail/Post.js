import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import Content from '../Content';
import RenderContent from '../embeds';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { PostsContextData, PostsContextActionable } from '../../../contexts';
import {
  postActionable,
  postData,
  postFocused,
  postMinHeight,
  postVisibility,
} from '../../../redux/selectors/postSelectors';
import PostDebug from './PostDebug';
import { hotkeyStatus } from '../../../common';
import { listingStatus } from '../../../redux/selectors/listingsSelector';

const classNames = require('classnames');

const Post = ({
  siteSettings,
  data,
  focused,
  visible,
  actionable,
  minHeight,
  listingsStatus,
  gotoLink,
}) => {
  const [renderedContent, setRenderedContent] = useState(null);

  const initView = () => {
    if (data.stickied && siteSettings.condenseSticky) {
      return false;
    }
    return siteSettings.view === 'expanded' || false;
  };

  const [expand, setExpand] = useState(initView());
  const [showDebug, setShowDebug] = useState(false);

  const isRendered = useRef(false);

  // Set the rendered content
  useEffect(() => {
    let isMounted = true;
    const renderContent = async () => {
      if (data.is_self && !data.selftext) {
        isRendered.current = true;
        return;
      }

      const getContent =
        data.crosspost_parent && data.crosspost_parent_list[0]
          ? await RenderContent(data.crosspost_parent_list[0])
          : await RenderContent(data);

      if (!getContent) {
        isRendered.current = true;
        return;
      }

      if (getContent.inline) {
        await getContent.inline.forEach(async (value, key) => {
          getContent.inline[key] = await value;
        });
      }
      if (isMounted) {
        setRenderedContent(getContent);
      }
    };
    if (isMounted && expand && !isRendered.current) {
      renderContent();
      isRendered.current = true;
    }
    return () => {
      isMounted = false;
    };
  }, [data, expand]);

  const toggleViewAction = () => {
    setExpand(!expand);
  };

  const toggleView = event => {
    toggleViewAction();
    event.preventDefault();
  };

  const gotoDuplicates = () => {
    if (!data.is_self) {
      const searchTo = `/duplicates/${data.id}`;
      gotoLink(searchTo);
    }
  };

  // @todo is there a way around pop up blockers?
  const openReddit = () => {
    window.open(`https://www.reddit.com${data.permalink}`, '_blank');
  };

  const openLink = () => {
    window.open(data.url, '_blank');
  };

  const toggleShowDebug = () => {
    setShowDebug(!showDebug);
  };

  const hotkeys = event => {
    if (
      hotkeyStatus() &&
      (listingsStatus === 'loaded' || listingsStatus === 'loadedAll')
    ) {
      const pressedKey = event.key;
      try {
        switch (pressedKey) {
          case 'x':
            toggleViewAction();
            break;
          case 'o':
          case 'Enter':
            openReddit();
            break;
          case 'l':
            openLink();
            break;
          case 'd':
            gotoDuplicates();
            break;
          default:
            break;
        }
      } catch (e) {
        // console.log(e);
      }
    }
  };

  useEffect(() => {
    if (actionable) {
      document.addEventListener('keydown', hotkeys);
    } else {
      document.removeEventListener('keydown', hotkeys);
    }
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  });

  const classArray = classNames('entry', 'list-group-item', {
    focused,
    visible,
    actionable,
    condensed: !expand,
  });

  const styles = {};
  let hideAll = false;
  if (!visible && minHeight) {
    styles.minHeight = minHeight;
    hideAll = true;
  }

  if (hideAll) {
    return (
      <div
        className={classArray}
        key={data.name}
        id={data.name}
        style={styles}
      />
    );
  }

  return (
    <div className={classArray} key={data.name} id={data.name} style={styles}>
      <div className="entry-interior">
        <PostsContextData.Provider value={data}>
          <PostsContextActionable.Provider value={actionable}>
            <PostHeader
              visible={visible}
              expand={expand}
              toggleView={toggleView}
            />
            {expand && (
              <Content content={renderedContent} load={visible} key={data.id} />
            )}
            <PostFooter
              debug={siteSettings.debug}
              toggleShowDebug={toggleShowDebug}
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
};

Post.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  postName: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  idx: PropTypes.number.isRequired,
  data: PropTypes.object.isRequired,
  focused: PropTypes.bool.isRequired,
  actionable: PropTypes.bool.isRequired,
  siteSettings: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  gotoLink: PropTypes.func.isRequired,
  minHeight: PropTypes.number,
  listingsStatus: PropTypes.string,
};

Post.defaultProps = {
  minHeight: 0,
  listingsStatus: 'unloaded',
};

const mapStateToProps = (state, props) => ({
  siteSettings: state.siteSettings,
  data: postData(state, props),
  visible: postVisibility(state, props),
  focused: postFocused(state, props),
  actionable: postActionable(state, props),
  minHeight: postMinHeight(state, props),
  listingsStatus: listingStatus(state),
});

export default connect(
  mapStateToProps,
  {
    gotoLink: push,
  },
  null
)(Post);
