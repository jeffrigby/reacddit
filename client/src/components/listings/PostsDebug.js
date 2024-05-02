import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router';
import queryString from 'query-string';
import {
  listingData,
  listingState,
} from '../../redux/selectors/listingsSelector';

function PostsDebug() {
  const [closed, setClosed] = useState(true);
  const location = useLocation();
  const match = useParams();

  const debugEnabled = useSelector((state) => state.siteSettings.debug);
  const listingsFilter = useSelector((state) => state.listingsFilter);
  const listingsState = useSelector((state) =>
    listingState(state, location.key)
  );
  const data = useSelector((state) => listingData(state, location.key));

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
    <div id="debugInfo" className={`p-2 ${closed && 'closed'}`}>
      {!closed ? (
        <>
          <button
            type="button"
            className="close"
            aria-label="Close"
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
        <button
          type="button"
          className="btn btn-primary btn-sm"
          title="Open Debug Info"
          onClick={() => setClosed(false)}
          aria-label="Open Debug Info"
        >
          <i className="fas fa-bug" />
        </button>
      )}
    </div>
  );
}

PostsDebug.propTypes = {};

export default PostsDebug;
