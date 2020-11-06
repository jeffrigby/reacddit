import React, { useContext, useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import throttle from 'lodash/throttle';
import SelfInline from './SelfInline';
import '../../../styles/self.scss';
import { PostsContextData } from '../../../contexts';

const classNames = require('classnames');

const cleanLinks = (html) => {
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
    matches.forEach((link) => {
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
  const [specs, setSpecs] = useState(null);
  const post = useContext(PostsContextData);
  const listType = useSelector((state) => state.listingsFilter.listType);
  const selfRef = useRef();
  const selfHTMLRef = useRef();

  const getHeights = () => {
    const dimensions = {};
    if (selfRef.current) {
      dimensions.self = selfRef.current.getBoundingClientRect().height;
    }

    if (selfHTMLRef.current) {
      dimensions.selfHTML = selfHTMLRef.current.scrollHeight;
    }
    setSpecs(dimensions);
  };

  useEffect(() => {
    getHeights();
    const throttledGetHeights = throttle(getHeights, 500);
    window.addEventListener('resize', throttledGetHeights, false);
    return () => {
      window.removeEventListener('resize', throttledGetHeights, false);
    };
  }, []);

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

  const showMore = specs && specs.selfHTML - specs.self > 10;
  const selfHTMLClasses = classNames('self-html', {
    'self-fade': showMore && !showAll,
    'sf-html-show-all': showAll,
  });

  const buttonText = !showAll ? (
    <>
      <i className="fas fa-angle-double-down" /> Read More
    </>
  ) : (
    <>
      <i className="fas fa-angle-double-up" /> Collapse
    </>
  );

  return (
    <>
      <div
        className={`self self-${post.kind} self-${post.kind}-${listType}`}
        ref={selfRef}
      >
        <div className={selfHTMLClasses} ref={selfHTMLRef}>
          {renderedHTML}
        </div>
        {showMore && (
          <div className="self-show-more text-right">
            <button
              type="button"
              className="btn btn-link btn-sm shadow-none p-0"
              title="Load More"
              onClick={toggleShow}
            >
              {buttonText}
            </button>
          </div>
        )}
        {inlineRendered}
      </div>
    </>
  );
};

Self.propTypes = {
  content: PropTypes.object.isRequired,
  load: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

export default Self;
