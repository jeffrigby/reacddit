import type { MouseEvent, KeyboardEvent } from 'react';
import {
  memo,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Content from '../Content';
import renderContent from '../embeds';
import PostFooter from './PostFooter';
import PostHeader from './PostHeader';
import {
  PostsContextData,
  PostsContextActionable,
  ListingsContextLastExpanded,
  useIntersectionObservers,
} from '../../../contexts';
import { hotkeyStatus } from '../../../common';
import {
  selectListingStatus,
  selectPostFocused,
  selectPostActionable,
} from '../../../redux/slices/listingsSlice';
import CommentReplyList from '../../comments/CommentReplyList';
import { useAppSelector } from '../../../redux/hooks';
import type {
  LinkData,
  CommentData,
  Listing,
  MoreChildrenData,
} from '../../../types/redditApi';

interface RenderedContent {
  inline?: Array<Promise<unknown> | unknown>;
  [key: string]: unknown;
}

interface UseRenderedContentReturn {
  renderedContent: RenderedContent | null;
}

function useRenderedContent(
  data: LinkData | CommentData,
  kind: string,
  expand: boolean
): UseRenderedContentReturn {
  const [renderedContent, setRenderedContent] =
    useState<RenderedContent | null>(null);

  // Used for debugging offscreen elements.
  const isRendered = useRef(false);

  useEffect(() => {
    const getRenderedContent = async (): Promise<void> => {
      // This is when there is no body.
      const linkData = data as LinkData;
      if (linkData.is_self && !linkData.selftext) {
        isRendered.current = true;
        return;
      }

      // Get the content from the crosspost
      const getContent =
        linkData.crosspost_parent && linkData.crosspost_parent_list?.[0]
          ? await renderContent(linkData.crosspost_parent_list[0], 't3')
          : await renderContent(data, kind);

      if (!getContent) {
        isRendered.current = true;
        return;
      }

      if (getContent.inline) {
        getContent.inline = await Promise.all(
          getContent.inline.map(async (value) => await value)
        );
      }

      setRenderedContent(getContent);
    };
    if (expand && !isRendered.current) {
      getRenderedContent();
      isRendered.current = true;
    }
    return () => {};
  }, [data, expand, kind]);

  return { renderedContent };
}

interface PostProps {
  post: { data: LinkData | CommentData; kind: string };
  duplicate?: boolean;
  parent?: boolean;
  postName: string;
  idx: number;
}

function Post({
  post,
  duplicate = false,
  parent = false,
  postName,
  idx,
}: PostProps): React.JSX.Element {
  const { data, kind } = post;
  const [hide, setHide] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [onScreen, setOnScreen] = useState<boolean>(false);
  const [showVisToggle, setShowVisToggle] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ listType?: string }>();

  const postRef = useRef<HTMLDivElement>(null);
  const minHeightRef = useRef<number>();

  const siteSettings = useAppSelector((state) => state.siteSettings);
  const listingsStatus = useAppSelector((state) =>
    selectListingStatus(state, location.key)
  );
  const focused = useAppSelector((state) =>
    selectPostFocused(state, postName, idx, location.key)
  );
  const actionable = useAppSelector((state) =>
    selectPostActionable(state, postName, idx, location.key)
  );

  const [lastExpanded, setLastExpanded] = useContext(
    ListingsContextLastExpanded
  ) as [string, (value: string) => void];

  // Get shared IntersectionObservers from context
  const { observeForLoading, observeForVisibility } =
    useIntersectionObservers();

  // Stable callbacks for observer handlers
  const handleLoadIntersection = useCallback((isIntersecting: boolean) => {
    setShouldLoad(isIntersecting);
  }, []);

  const handleVisibilityIntersection = useCallback(
    (isIntersecting: boolean) => {
      setOnScreen(isIntersecting);
    },
    []
  );

  // Register with shared loading observer
  useEffect(() => {
    if (!postRef.current) {
      return;
    }
    return observeForLoading(postRef.current, handleLoadIntersection);
  }, [observeForLoading, handleLoadIntersection]);

  // Register with shared visibility observer
  useEffect(() => {
    if (!postRef.current) {
      return;
    }
    return observeForVisibility(postRef.current, handleVisibilityIntersection);
  }, [observeForVisibility, handleVisibilityIntersection]);

  // Use ResizeObserver for more efficient height tracking
  useEffect(() => {
    if (!postRef.current || !shouldLoad) {
      return;
    }

    const updateMinHeight = () => {
      if (postRef.current) {
        minHeightRef.current = postRef.current.getBoundingClientRect().height;
      }
    };

    // Initial measurement
    updateMinHeight();

    // Modern ResizeObserver instead of window resize events
    const resizeObserver = new ResizeObserver(() => {
      updateMinHeight();
    });

    resizeObserver.observe(postRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [shouldLoad]);

  const initView = useCallback(() => {
    if (params.listType === 'comments') {
      return true;
    }

    if (parent) {
      return true;
    }

    const linkData = data as LinkData;
    if (linkData.stickied && siteSettings.condenseSticky && !parent) {
      return false;
    }

    if (linkData.pinned && siteSettings.condensePinned && !parent) {
      return false;
    }

    if (duplicate && siteSettings.condenseDuplicate) {
      return false;
    }
    return siteSettings.view === 'expanded' || false;
  }, [
    params.listType,
    data,
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
    let reposInt: NodeJS.Timeout | undefined;
    if (siteSettings.view === 'condensed' && lastExpanded) {
      // Close one that was already open.
      if (expand && data.name !== lastExpanded) {
        setExpand(false);
      } else if (data.name === lastExpanded && !expand) {
        setExpand(true);
      }

      if (data.name === lastExpanded) {
        const reposition = (): boolean => {
          const lastExpandedPost = document.getElementById(lastExpanded);
          if (!lastExpandedPost) {
            return false;
          }

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
    (event: MouseEvent | KeyboardEvent) => {
      toggleViewAction();
      event.preventDefault();
    },
    [toggleViewAction]
  );

  const gotoDuplicates = useCallback(() => {
    const linkData = data as LinkData;
    if (!linkData.is_self) {
      const searchTo = `/duplicates/${linkData.id}`;
      navigate(searchTo);
    }
  }, [data, navigate]);

  // @todo is there a way around pop up blockers?
  const openReddit = useCallback(() => {
    window.open(`https://www.reddit.com${data.permalink}`, '_blank');
  }, [data.permalink]);

  const openLink = useCallback(() => {
    const linkData = data as LinkData;
    window.open(linkData.url, '_blank');
  }, [data]);

  useEffect(() => {
    const hotkeys = (event: Event): void => {
      const keyEvent = event as globalThis.KeyboardEvent;
      if (
        hotkeyStatus() &&
        (listingsStatus === 'loaded' || listingsStatus === 'loadedAll')
      ) {
        const pressedKey = keyEvent.key;
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
          console.error(e);
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

  const commentDepth = kind === 't1' ? (data as CommentData).depth : undefined;
  const classArray = classNames('entry', 'list-group-item', `kind-${kind}`, {
    focused,
    actionable,
    'post-parent': parent,
    condensed: !expand,
    expanded: expand,
    duplicate,
    loaded: shouldLoad,
    'on-screen': onScreen,
    'comment-child': kind === 't1' && commentDepth != null && commentDepth > 0,
  });

  const styles: React.CSSProperties = {};
  if (!isLoaded && minHeightRef.current && expand) {
    styles.minHeight = minHeightRef.current;
  }

  const commentData = data as CommentData;
  const isReplies =
    kind === 't1' && commentData.replies != null && commentData.replies !== '';

  const visibilityIcon = hide ? faEye : faEyeSlash;

  const visibilityToggle = showVisToggle ? (
    <div className="debug-visibility">
      <Button
        aria-label={hide ? 'Show' : 'Hide'}
        className="shadow-none m-0 p-0 me-1"
        size="sm"
        title="Toggle visiblity"
        variant="primary"
        onClick={() => setHide(!hide)}
      >
        <FontAwesomeIcon icon={visibilityIcon} />
      </Button>
    </div>
  ) : null;

  const postContext = useMemo(
    () => ({ post, isLoaded, actionable }),
    // content: renderedContent,
    [actionable, isLoaded, post]
  );

  return (
    <PostsContextData.Provider value={postContext}>
      <PostsContextActionable.Provider value={actionable}>
        <div
          className={classArray}
          id={data.name}
          key={data.name}
          ref={postRef}
          style={styles}
        >
          <div className={`entry-interior entry-interior-${kind}`}>
            {visibilityToggle}
            <PostHeader
              duplicate={duplicate}
              expand={expand}
              parent={parent}
              toggleView={toggleView}
            />
            <div className="entry-after-header">
              {expand && (
                <>
                  <Content
                    content={renderedContent as Record<string, unknown>}
                    key={data.id}
                  />

                  <PostFooter
                    debug={siteSettings.debug}
                    renderedContent={renderedContent as Record<string, unknown>}
                    setShowVisToggle={setShowVisToggle}
                    showVisToggle={showVisToggle}
                  />
                </>
              )}
              {isReplies && expand && (
                <CommentReplyList
                  linkId={commentData.link_id ?? ''}
                  replies={
                    commentData.replies as Listing<
                      CommentData | MoreChildrenData
                    >
                  }
                />
              )}
            </div>
          </div>
        </div>
      </PostsContextActionable.Provider>
    </PostsContextData.Provider>
  );
}

export default memo(Post);
