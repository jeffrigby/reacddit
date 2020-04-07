import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
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

const classNames = require('classnames');

function useRenderedContent(data, kind, expand) {
  const [renderedContent, setRenderedContent] = useState(null);
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
}) => {
  const { data, kind } = post;

  const initView = useCallback(() => {
    if (data.stickied && siteSettings.condenseSticky) {
      return false;
    }

    if (duplicate && siteSettings.condenseDuplicate) {
      return false;
    }
    return siteSettings.view === 'expanded' || false;
  }, [
    data.stickied,
    siteSettings.condenseSticky,
    siteSettings.view,
    siteSettings.condenseDuplicate,
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
    event => {
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

  // Always visible if it's a comment
  // const isVisible = postType === 'comments' ? true : visible;
  const isVisible = visible;

  const classArray = classNames('entry', 'list-group-item', `kind-${kind}`, {
    focused,
    visible: isVisible,
    actionable,
    condensed: !expand,
    duplicate,
    'comment-child': kind === 't1' && data.depth > 0,
  });

  const styles = {};
  // let hideAll = false;
  // if (!isVisible && minHeight) {
  //   styles.minHeight = minHeight;
  //   hideAll = true;
  // }

  // if (hideAll) {
  //   return (
  //     <div
  //       className={classArray}
  //       key={data.name}
  //       id={data.name}
  //       style={styles}
  //     />
  //   );
  // }

  const isReplies = kind === 't1' && data.replies;

  return (
    <div className={classArray} key={data.name} id={data.name} style={styles}>
      <div className="entry-interior">
        <PostsContextData.Provider value={post}>
          <PostsContextActionable.Provider value={actionable}>
            <PostHeader
              visible={isVisible}
              expand={expand}
              toggleView={toggleView}
              duplicate={duplicate}
            />
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
            />
          </PostsContextActionable.Provider>
        </PostsContextData.Provider>
        {isReplies && expand && (
          <CommentReplyList replies={data.replies} linkId={data.link_id} />
        )}
      </div>
    </div>
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
};

Post.defaultProps = {
  // minHeight: 0,
  listingsStatus: 'unloaded',
  duplicate: false,
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
