import React from 'react';
import PropTypes from 'prop-types';
import Content from '../Content';

const cleanLinks = html => {
  let rawhtml = html;
  rawhtml = rawhtml
    .replace(/<a\s+href=/gi, '<a target="_blank" href=')
    .replace(/<p>&#x200B;<\/p>/gi, '')
    .replace(/<p>\s+<\/p>/gi, '');

  // Shorten all text in anchor tags
  const regex = /<a [^>]+>(https?:\/\/[^>]+)<\/a>/gm;
  const matches = [];
  let match = regex.exec(rawhtml);
  while (match !== null) {
    matches.push(match[1]);
    match = regex.exec(rawhtml);
  }

  if (matches.length > 0) {
    matches.forEach(link => {
      if (link.length >= 20) {
        const newLink = `${link
          .replace(/https?:\/\//, '')
          .substring(0, 25)}...`;
        rawhtml = rawhtml.replace(`>${link}<`, `>${newLink}<`);
      }
    });
  }

  return rawhtml;
};

const Self = ({ content, load, name }) => {
  const rawhtml = cleanLinks(content.html);

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
