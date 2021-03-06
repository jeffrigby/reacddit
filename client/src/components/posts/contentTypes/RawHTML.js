import React, { useContext } from 'react';
// import PropTypes from 'prop-types';
import { PostsContextData } from '../../../contexts';

const RawHTML = () => {
  const postContext = useContext(PostsContextData);
  const { content } = postContext;
  const rawhtml = content.html;

  // eslint-disable-next-line react/no-danger
  const html = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;

  return <div className="raw-html">{html}</div>;
};

RawHTML.propTypes = {};

export default RawHTML;
