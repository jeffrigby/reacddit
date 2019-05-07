import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SelfInline from './SelfInline';

const cleanLinks = html => {
  let rawhtml = html;
  rawhtml = rawhtml
    .replace(
      /<a\s+href=/gi,
      '<a target="_blank" rel="noopener noreferrer" href='
    )
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
  const [showAll, setShowAll] = useState(false);
  const rawhtml = cleanLinks(content.html);

  // eslint-disable-next-line react/no-danger
  const html = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;
  const inlineRendered = (
    <SelfInline inline={content.inline} name={name} load={load} />
  );

  return (
    <div className="self">
      <div
        className={`self-html mb-2 ${showAll ? ' sf-html-show-all' : ''}`}
        onClick={() => {
          setShowAll(!showAll);
        }}
        role="presentation"
      >
        {html}
      </div>
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
