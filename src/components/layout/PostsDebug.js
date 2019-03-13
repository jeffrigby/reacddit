import React from 'react';
import PropTypes from 'prop-types';

const queryString = require('query-string');

const PostsDebug = ({
  listingsFilter,
  focused,
  visible,
  location,
  match,
  requestURL,
}) => {
  const qs = queryString.parse(location.search);

  const listingFilterStriing = JSON.stringify(
    { ...listingsFilter, t: qs.t },
    null,
    2
  );

  const visFocu = JSON.stringify({ focused, visible }, null, 2);
  const router = JSON.stringify({ location, match }, null, 2);

  return (
    <div id="debugInfo" className="p-2">
      <div className="small">
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
          <div>{requestURL}</div>
        </div>
      </div>
    </div>
  );
};

PostsDebug.propTypes = {
  listingsFilter: PropTypes.object.isRequired,
  focused: PropTypes.string.isRequired,
  visible: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  requestURL: PropTypes.string.isRequired,
};

export default PostsDebug;
