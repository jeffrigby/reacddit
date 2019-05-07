import React from 'react';
import PropTypes from 'prop-types';

const RawHTML = ({ content, load }) => {
  const rawhtml = content.html;

  // eslint-disable-next-line react/no-danger
  const html = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;

  return <div className="raw-html">{html}</div>;
};

RawHTML.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
};

export default RawHTML;
