import React from 'react';
import PropTypes from 'prop-types';
import Content from '../Content';

const Self = ({ content, load, name }) => {
  let rawhtml = content.html;
  rawhtml = rawhtml
    .replace(/<a\s+href=/gi, '<a target="_blank" href=')
    .replace(/<p>&#x200B;<\/p>/gi, '')
    .replace(/<p>\s+<\/p>/gi, '');
  // eslint-disable-next-line react/no-danger
  const html = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;
  let inlineRendered;
  if (content.inline.length > 0) {
    let i = 0;
    inlineRendered = content.inline.map(item => {
      i += 1;
      const guid = `inline${name}${i}`;
      return (
        <div className="inline-render" key={guid}>
          <Content content={item} load={load} name={name} />
        </div>
      );
    }, this);
  }

  return (
    <div className="self">
      {html}
      {inlineRendered}
    </div>
  );
};

Self.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

export default Self;
