import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import throttle from 'lodash/throttle';
import Content from '../Content';
import RenderContent from '../embeds';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import { PostsContextData, PostsContextActionable } from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import { listingStatus } from '../../../redux/selectors/listingsSelector';
import {
  postActionable,
  postFocused,
  // postMinHeight,
  postVisibility,
} from '../../../redux/selectors/postSelectors';
import CommentReplyList from '../../comments/CommentReplyList';
import { useLocation } from 'react-router-dom';

const classNames = require('classnames');

function useRenderedContent(data, kind, expand) {
  const [renderedContent, setRenderedContent] = useState(null);
  // Used for debugging offscreen elements.
  const isRendered = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const getRenderedContent = async () => {
      // This is when there is no body.
      if (data.is_self && !data.selftext) {
        isRendered.current = true;
        return;
      }

      // Get the content from the crosspost
      const getContent =
        data.crosspost_parent && data.crosspost_parent_list[0]
          ? await RenderContent(data.crosspost_parent_list[0], 't3')
          : await RenderContent(data, kind);

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
      getRenderedContent();
      isRendered.current = true;
    }
    return () => {
      isMounted = false;
    };
  }, [data, expand, kind]);

  return { renderedContent };
}

const Post = ({
  siteSettings,
  post,
  focused,
  visible,
  actionable,
  // minHeight,
  listingsStatus,
  gotoLink,
  duplicate,
  parent,
}) => {
  const { data, kind } = post;
  const [hide, setHide] = useState(false);
  const [showVisToggle, setShowVisToggle] = useState(false);
  const postRef = useRef();
  const minHeightRef = useRef();

  const getMinHeight = useCallback(() => {
    if (postRef.current && visible) {
      minHeightRef.current = postRef.current.getBoundingClientRect().height;
    }
  }, [visible]);

  useEffect(() => {
    getMinHeight();
    const throttledGetHeights = throttle(getMinHeight, 500);
    if (visible) {
      window.addEventListener('resize', throttledGetHeights, false);
    } else {
      window.removeEventListener('resize', throttledGetHeights, false);
    }
    return () => {
      window.removeEventListener('resize', throttledGetHeights, false);
    };
  }, [getMinHeight, visible]);

  useEffect(() => {
    if (visible) {
      getMinHeight();
      // trigger it after a second in case things re-render
      setTimeout(() => {
        getMinHeight();
      }, 500);
    }
  });

  const initView = useCallback(() => {
    if (data.stickied && siteSettings.condenseSticky && !parent) {
      return false;
    }

    if (data.pinned && siteSettings.condensePinned && !parent) {
      return false;
    }

    if (duplicate && siteSettings.condenseDuplicate) {
      return false;
    }
    return siteSettings.view === 'expanded' || false;
  }, [
    data.stickied,
    data.pinned,
    siteSettings.condenseSticky,
    siteSettings.condensePinned,
    siteSettings.condenseDuplicate,
    siteSettings.view,
    duplicate,
  ]);

  const [expand, setExpand] = useState(initView());

  useEffect(() => {
    const view = initView();
    setExpand(view);
  }, [initView]);

  const { renderedContent } = useRenderedContent(data, kind, expand);

  const toggleViewAction = useCallback(() => {
    setExpand(!expand);
  }, [expand]);

  const toggleView = useCallback(
    (event) => {
      toggleViewAction();
      event.preventDefault();
    },
    [toggleViewAction]
  );

  const gotoDuplicates = useCallback(() => {
    if (!data.is_self) {
      const searchTo = `/duplicates/${data.id}`;
      gotoLink(searchTo);
    }
  }, [data.id, data.is_self, gotoLink]);

  // @todo is there a way around pop up blockers?
  const openReddit = useCallback(() => {
    window.open(`https://www.reddit.com${data.permalink}`, '_blank');
  }, [data.permalink]);

  const openLink = useCallback(() => {
    window.open(data.url, '_blank');
  }, [data.url]);

  useEffect(() => {
    const hotkeys = (event) => {
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

    if (actionable) {
      document.addEventListener('keydown', hotkeys);
    } else {
      document.removeEventListener('keydown', hotkeys);
    }
    return () => {
      document.removeEventListener('keydown', hotkeys);
    };
  }, [
    actionable,
    gotoDuplicates,
    listingsStatus,
    openLink,
    openReddit,
    toggleViewAction,
  ]);

  const isVisible = hide ? false : visible;

  const classArray = classNames('entry', 'list-group-item', `kind-${kind}`, {
    focused,
    visible: isVisible,
    actionable,
    'post-parent': parent,
    condensed: !expand,
    duplicate,
    'comment-child': kind === 't1' && data.depth > 0,
  });

  const styles = {};
  if (!isVisible && minHeightRef.current) {
    styles.minHeight = minHeightRef.current;
  }

  const isReplies = kind === 't1' && data.replies;

  const visibilityToggle = showVisToggle ? (
    <div className="debug-visibility">
      <button
        className="btn btn-primary btn-sm shadow-none m-0 p-0 mr-1"
        onClick={() => setHide(!hide)}
        title="Toggle visiblity"
        type="button"
      >
        <i className={`fas ${hide ? 'fa-eye' : 'fa-eye-slash'}`} />
      </button>
    </div>
  ) : null;

  return (
    <PostsContextData.Provider value={post}>
      <PostsContextActionable.Provider value={actionable}>
        <div
          className={classArray}
          key={data.name}
          id={data.name}
          style={styles}
          ref={postRef}
        >
          <div className={`entry-interior entry-interior-${kind}`}>
            {visibilityToggle}
            <PostHeader
              visible={isVisible}
              expand={expand}
              toggleView={toggleView}
              duplicate={duplicate}
              parent={parent}
            />
            <div className="entry-after-header">
              {expand && (
                <Content
                  content={renderedContent}
                  load={isVisible}
                  key={data.id}
                />
              )}
              <PostFooter
                debug={siteSettings.debug}
                renderedContent={renderedContent}
                visible={isVisible}
                showVisToggle={showVisToggle}
                setShowVisToggle={setShowVisToggle}
              />
              {isReplies && expand && (
                <CommentReplyList
                  replies={data.replies}
                  linkId={data.link_id}
                />
              )}
            </div>
          </div>
        </div>
      </PostsContextActionable.Provider>
    </PostsContextData.Provider>
  );
};

Post.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  postName: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  idx: PropTypes.number.isRequired,
  post: PropTypes.object.isRequired,
  focused: PropTypes.bool.isRequired,
  actionable: PropTypes.bool.isRequired,
  siteSettings: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
  gotoLink: PropTypes.func.isRequired,
  // minHeight: PropTypes.number,
  listingsStatus: PropTypes.string,
  duplicate: PropTypes.bool,
  parent: PropTypes.bool,
};

Post.defaultProps = {
  // minHeight: 0,
  listingsStatus: 'unloaded',
  duplicate: false,
  parent: false,
};

const mapStateToProps = (state, props) => ({
  siteSettings: state.siteSettings,
  listingsStatus: listingStatus(state),
  // minHeight: postMinHeight(state, props),
  visible: postVisibility(state, props),
  focused: postFocused(state, props),
  actionable: postActionable(state, props),
});

export default React.memo(
  connect(
    mapStateToProps,
    {
      gotoLink: push,
    },
    null
  )(Post)
);
