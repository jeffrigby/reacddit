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
  const [showAll, setShowAll] = useState(content.expand || false);

  const toggleShow = () => {
    if (content.expand) return;
    setShowAll(!showAll);
  };

  const { html } = content;
  if (!html) return null;
  const rawhtml = cleanLinks(html);

  // eslint-disable-next-line react/no-danger
  const renderedHTML = <div dangerouslySetInnerHTML={{ __html: rawhtml }} />;
  const inlineRendered = content.inline.length ? (
    <SelfInline
      inline={content.inline}
      inlineLinks={content.inlineLinks}
      name={name}
      load={load}
    />
  ) : null;

  return (
    <div className="self">
      <div
        className={`self-html ${showAll ? ' sf-html-show-all' : ''}`}
        onClick={toggleShow}
        role="presentation"
      >
        {renderedHTML}
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
