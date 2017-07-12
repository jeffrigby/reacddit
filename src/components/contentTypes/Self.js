import React, { PropTypes } from 'react';
import Content from '../Content';

const Self = ({ content, load, name }) => {
  let rawhtml = content.html;
  rawhtml = rawhtml.replace(/<a\s+href=/gi, '<a target="_blank" href=');
  const html = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;
  let inlineRendered;
  if (content.inline.length > 0) {
    let i = 0;
    inlineRendered = content.inline
      .map((item) => {
        i += 1;
        const guid = `inline${name}${i}`;
        return <div className="inline-render" key={guid}><Content content={item} load={load} name={name} /></div>;
      }, this);
  }

  return (<div className="self">
    {html}
    {inlineRendered}
  </div>);
};

Self.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

export default Self;
