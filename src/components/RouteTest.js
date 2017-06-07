import React, { PropTypes } from 'react';

const RouteTest = ({ match }) => {
  console.log(match);
  return (<div>
    This is a test of the router!!!!!!! {match.url}
  </div>);
};

RouteTest.propTypes = {
  match: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

export default RouteTest;
