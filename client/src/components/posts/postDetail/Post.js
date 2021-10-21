import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import throttle from 'lodash/throttle';
import { useParams } from 'react-router';
import Content from '../Content';
import RenderContent from '../embeds';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import {
  PostsContextData,
  PostsContextActionable,
  ListingsContextLastExpanded,
} from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import { listingStatus } from '../../../redux/selectors/listingsSelector';
import {
  postActionable,
  postFocused,
} from '../../../redux/selectors/postSelectors';
import CommentReplyList from '../../comments/CommentReplyList';

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

const Post = ({ post, duplicate, parent, postName, idx }) => {
  const { data, kind } = post;
  const [hide, setHide] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [onScreen, setOnScreen] = useState({});
  const [showVisToggle, setShowVisToggle] = useState(false);
  const params = useParams();
  const postRef = useRef();
  const minHeightRef = useRef();

  const siteSettings = useSelector((state) => state.siteSettings);
  const listingsStatus = useSelector((state) => listingStatus(state));
  const focused = useSelector((state) => postFocused(state, postName, idx));
  const actionable = useSelector((state) =>
    postActionable(state, postName, idx)
  );

  const dispatch = useDispatch();

  const [lastExpanded, setLastExpanded] = useContext(
    ListingsContextLastExpanded
  );

  // Set observer for loading range.
  useEffect(() => {
    const loadObserver = new IntersectionObserver(
      (entries) => {
        setShouldLoad(entries[0].isIntersecting);
      },
      { threshold: 0, rootMargin: '250px 0px 500px 0px' }
    );
    loadObserver.observe(postRef.current);
    return () => loadObserver.disconnect();
  }, [postRef]);

  // Set observer for on screen range.
  useEffect(() => {
    const onScreenObs = new IntersectionObserver(
      (entries) => setOnScreen(entries[0].isIntersecting),
      { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
    );
    onScreenObs.observe(postRef.current);
    return () => onScreenObs.disconnect();
  }, [postRef]);

  const getMinHeight = useCallback(() => {
    if (postRef.current && shouldLoad) {
      minHeightRef.current = postRef.current.getBoundingClientRect().height;
    }
  }, [shouldLoad]);

  useEffect(() => {
    getMinHeight();
    const throttledGetHeights = throttle(getMinHeight, 500);
    if (shouldLoad) {
      window.addEventListener('resize', throttledGetHeights, false);
    } else {
      window.removeEventListener('resize', throttledGetHeights, false);
    }
    return () => {
      window.removeEventListener('resize', throttledGetHeights, false);
    };
  }, [getMinHeight, shouldLoad]);

  useEffect(() => {
    if (shouldLoad) {
      getMinHeight();
      // trigger it after a second in case things re-render
      setTimeout(() => {
        getMinHeight();
      }, 500);
    }
  });

  const initView = useCallback(() => {
    if (params.listType === 'comments') {
      return true;
    }

    if (parent) {
      return true;
    }

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
    params.listType,
    data.stickied,
    data.pinned,
    siteSettings.condenseSticky,
    siteSettings.condensePinned,
    siteSettings.condenseDuplicate,
    siteSettings.view,
    parent,
    duplicate,
  ]);

  const [expand, setExpand] = useState(initView());

  useEffect(() => {
    const view = initView();
    setExpand(view);
  }, [initView]);

  useEffect(() => {
    let reposInt;
    if (siteSettings.view === 'condensed' && lastExpanded) {
      // Close one that was already open.
      if (expand && data.name !== lastExpanded) {
        setExpand(false);
      } else if (data.name === lastExpanded && !expand) {
        setExpand(true);
      }

      if (data.name === lastExpanded) {
        const reposition = () => {
          const lastExpandedPost = document.getElementById(lastExpanded);
          const { top, bottom } = lastExpandedPost.getBoundingClientRect();
          const bottomPos = bottom - window.innerHeight;

          // Top is above the top of the screen
          if (top < 50 || bottomPos > -10) {
            const scrollBy = top - 50;
            window.scrollBy({ top: scrollBy, left: 0 });
            return true;
          }
          return false;
        };

        let timesRun = 0;
        reposInt = setInterval(() => {
          timesRun += 1;
          const triggered = reposition();
          if (triggered || timesRun === 5) {
            clearInterval(reposInt);
          }
        }, 100);
      }
    }
    return () => {
      clearInterval(reposInt);
    };
  }, [data.name, expand, lastExpanded, siteSettings.view]);

  const { renderedContent } = useRenderedContent(data, kind, expand);

  const toggleViewAction = useCallback(() => {
    if (siteSettings.view === 'expanded') {
      setExpand(!expand);
    } else {
      const lastexp = !expand ? data.name : '';
      setLastExpanded(lastexp);
      setExpand(!expand);
    }
  }, [data.name, expand, setLastExpanded, siteSettings.view]);

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
      dispatch(push(searchTo));
    }
  }, [data.id, data.is_self, dispatch]);

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

  const isLoaded = hide ? false : shouldLoad;
  // const isActionable =
  //   siteSettings.view === 'expanded' ? actionable : lastExpanded === data.name;
  // const isFocused =
  //   siteSettings.view === 'expanded' ? focused : lastExpanded === data.name;

  const classArray = classNames('entry', 'list-group-item', `kind-${kind}`, {
    focused,
    actionable,
    'post-parent': parent,
    condensed: !expand,
    expanded: expand,
    duplicate,
    loaded: shouldLoad,
    'on-screen': onScreen,
    'comment-child': kind === 't1' && data.depth > 0,
  });

  const styles = {};
  if (!isLoaded && minHeightRef.current && expand) {
    styles.minHeight = minHeightRef.current;
  }

  const isReplies = kind === 't1' && data.replies;

  const visibilityToggle = showVisToggle ? (
    <div className="debug-visibility">
      <button
        className="btn btn-primary btn-sm shadow-none m-0 p-0 me-1"
        onClick={() => setHide(!hide)}
        title="Toggle visiblity"
        type="button"
      >
        <i className={`fas ${hide ? 'fa-eye' : 'fa-eye-slash'}`} />
      </button>
    </div>
  ) : null;

  const postContext = {
    post,
    isLoaded,
    actionable,
    // content: renderedContent,
  };

  return (
    <PostsContextData.Provider value={postContext}>
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
              expand={expand}
              toggleView={toggleView}
              duplicate={duplicate}
              parent={parent}
            />
            <div className="entry-after-header">
              {expand && (
                <>
                  <Content key={data.id} content={renderedContent} />

                  <PostFooter
                    debug={siteSettings.debug}
                    renderedContent={renderedContent}
                    showVisToggle={showVisToggle}
                    setShowVisToggle={setShowVisToggle}
                  />
                </>
              )}
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
  postName: PropTypes.string.isRequired,
  idx: PropTypes.number.isRequired,
  post: PropTypes.object.isRequired,
  // visible: PropTypes.bool.isRequired,
  duplicate: PropTypes.bool,
  parent: PropTypes.bool,
};

Post.defaultProps = {
  duplicate: false,
  parent: false,
};

export default memo(Post);
