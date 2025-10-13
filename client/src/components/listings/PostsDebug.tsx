import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';
import { useLocation, useParams } from 'react-router';
import queryString from 'query-string';
import { useAppSelector } from '@/redux/hooks';
import {
  listingData,
  listingState,
} from '../../redux/selectors/listingsSelector';

function PostsDebug() {
  const [closed, setClosed] = useState(true);
  const location = useLocation();
  const match = useParams();

  const debugEnabled = useAppSelector((state) => state.siteSettings.debug);
  const listingsFilter = useAppSelector((state) => state.listingsFilter);
  const listingsState = useAppSelector((state) =>
    listingState(state, location.key)
  );
  const data = useAppSelector((state) => listingData(state, location.key));

  const { actionable, focused, visible } = listingsState;

  if (!debugEnabled) {
    return null;
  }

  const { requestUrl } = data;

  const qs = queryString.parse(location.search);

  const listingFilterStriing = JSON.stringify(
    { ...listingsFilter, t: qs.t },
    null,
    2
  );

  const visFocu = JSON.stringify({ focused, visible, actionable }, null, 2);
  const router = JSON.stringify({ location, match }, null, 2);

  return (
    <div className={`p-2 ${closed && 'closed'}`} id="debugInfo">
      {!closed ? (
        <>
          <button
            aria-label="Close"
            className="close"
            type="button"
            onClick={() => setClosed(true)}
          >
            <span aria-hidden="true">&times;</span>
          </button>
          <div className="small debug-info-content">
            <div>
              <strong>Filter:</strong>
              <pre className="code">{listingFilterStriing}</pre>
            </div>
            <div>
              <strong>Viewport:</strong>
              <pre className="code">{visFocu}</pre>
            </div>
            <div>
              <strong>Router:</strong>
              <pre className="code">{router}</pre>
            </div>
            <div>
              <strong>URL:</strong>
              <div>{requestUrl}</div>
            </div>
          </div>
        </>
      ) : (
        <Button
          aria-label="Open Debug Info"
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
