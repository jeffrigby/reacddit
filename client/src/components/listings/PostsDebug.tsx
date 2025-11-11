import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBug,
  faTimes,
  faCopy,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useLocation, useParams } from 'react-router';
import queryString from 'query-string';
import copy from 'copy-to-clipboard';
import { useAppSelector } from '@/redux/hooks';
import { useGetMeQuery } from '@/redux/api';
import {
  selectListingData,
  selectUiState,
  selectListingStatus,
} from '../../redux/slices/listingsSlice';
import {
  selectBearerStatus,
  selectIsAuth,
} from '../../redux/slices/redditBearerSlice';

interface CopiedState {
  [key: string]: boolean;
}

function PostsDebug() {
  const [closed, setClosed] = useState(true);
  const [copied, setCopied] = useState<CopiedState>({});
  const location = useLocation();
  const match = useParams();

  const debugEnabled = useAppSelector((state) => state.siteSettings.debug);
  const listingsFilter = useAppSelector(
    (state) => state.listings.currentFilter
  );
  const listingsState = useAppSelector((state) =>
    selectUiState(state, location.key)
  );
  const data = useAppSelector((state) =>
    selectListingData(state, location.key)
  );
  const listingStatus = useAppSelector((state) =>
    selectListingStatus(state, location.key)
  );

  // Auth state - RTK Query
  const { data: me, isLoading, isError, isSuccess } = useGetMeQuery();
  const meStatus = isLoading
    ? 'loading'
    : isError
      ? 'failed'
      : isSuccess
        ? 'succeeded'
        : 'idle';
  const bearerStatus = useAppSelector(selectBearerStatus);
  const isAuth = useAppSelector(selectIsAuth);

  const { actionable, focused, visible } = listingsState;

  if (!debugEnabled) {
    return null;
  }

  const { requestUrl, children } = data;
  const postsCount = Object.keys(children ?? {}).length;
  const postIds = Object.keys(children ?? {});

  const qs = queryString.parse(location.search);

  const handleCopy = (key: string, text: string) => {
    const success = copy(text);

    if (success) {
      setCopied({ ...copied, [key]: true });
      setTimeout(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      }, 2000);
    } else {
      console.error('Failed to copy:', text);
    }
  };

  function CopyButton({
    sectionKey,
    text,
  }: {
    sectionKey: string;
    text: string;
  }) {
    return (
      <Button
        className="btn-copy"
        size="sm"
        variant="link"
        onClick={() => handleCopy(sectionKey, text)}
      >
        <FontAwesomeIcon icon={copied[sectionKey] ? faCheck : faCopy} />
      </Button>
    );
  }

  const listingFilterString = JSON.stringify(
    { ...listingsFilter, t: qs.t },
    null,
    2
  );

  const visFocu = JSON.stringify({ focused, visible, actionable }, null, 2);
  const router = JSON.stringify({ location, match }, null, 2);

  // Posts state
  const postsState = JSON.stringify(
    {
      count: postsCount,
      status: listingStatus,
      fetchType: data.fetchType,
      hasMore: !!data.after,
      postIds: postIds.slice(0, 10),
      ...(postIds.length > 10 && {
        moreIds: `... ${postIds.length - 10} more`,
      }),
    },
    null,
    2
  );

  // Auth state
  const authState = JSON.stringify(
    {
      authenticated: isAuth,
      bearerStatus,
      meStatus,
      username: me?.name ?? 'anonymous',
      ...(me && {
        karma: {
          link: me.link_karma,
          comment: me.comment_karma,
        },
      }),
    },
    null,
    2
  );

  return (
    <div className={`${closed && 'closed'}`} id="debugInfo">
      {!closed ? (
        <Card className="debug-panel shadow-lg">
          <Card.Header className="d-flex justify-content-between align-items-center py-2 px-3">
            <div className="d-flex align-items-center gap-2">
              <FontAwesomeIcon icon={faBug} />
              <strong>Debug Info</strong>
            </div>
            <Button
              aria-label="Close Debug Info"
              className="btn-close-debug"
              size="sm"
              variant="outline-secondary"
              onClick={() => setClosed(true)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </Button>
          </Card.Header>
          <Card.Body className="debug-info-content p-3">
            <div className="debug-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="debug-section-title mb-0">Authentication</h6>
                <CopyButton sectionKey="auth" text={authState} />
              </div>
              <pre className="debug-code">{authState}</pre>
            </div>

            <div className="debug-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="debug-section-title mb-0">Posts/Listings</h6>
                <CopyButton sectionKey="posts" text={postsState} />
              </div>
              <pre className="debug-code">{postsState}</pre>
            </div>

            <div className="debug-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="debug-section-title mb-0">Filter</h6>
                <CopyButton sectionKey="filter" text={listingFilterString} />
              </div>
              <pre className="debug-code">{listingFilterString}</pre>
            </div>

            <div className="debug-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="debug-section-title mb-0">Viewport</h6>
                <CopyButton sectionKey="viewport" text={visFocu} />
              </div>
              <pre className="debug-code">{visFocu}</pre>
            </div>

            <div className="debug-section mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="debug-section-title mb-0">Router</h6>
                <CopyButton sectionKey="router" text={router} />
              </div>
              <pre className="debug-code">{router}</pre>
            </div>

            <div className="debug-section">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="debug-section-title mb-0">Request URL</h6>
                <CopyButton sectionKey="url" text={requestUrl ?? ''} />
              </div>
              <div className="debug-url">{requestUrl}</div>
            </div>
          </Card.Body>
        </Card>
      ) : (
        <Button
          aria-label="Open Debug Info"
          className="debug-toggle-btn"
          size="sm"
          title="Open Debug Info"
          variant="primary"
          onClick={() => setClosed(false)}
        >
          <FontAwesomeIcon icon={faBug} />
        </Button>
      )}
    </div>
  );
}

export default PostsDebug;
