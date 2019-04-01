import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Content from '../Content';

const SelfInline = ({ inline, load, name }) => {
  const [inlineIdx, setInlineIdx] = useState(0);

  if (inline.length === 0) {
    return null;
  }

  const inlineRendered = (
    <div className="inline-render">
      <Content content={inline[inlineIdx]} load={load} name={name} />
    </div>
  );

  let inlineNav;
  if (inline.length > 1) {
    const pageLinks = [];
    inline.forEach((value, idx) => {
      const key = `${name}-inline-${idx}`;
      pageLinks.push(
        <li
          key={key}
          className={`page-item inline-pager${inlineIdx === idx && ' active'}`}
        >
          <button
            className="page-link"
            type="button"
            onClick={() => setInlineIdx(idx)}
          >
            {idx + 1}
          </button>
        </li>
      );
    });

    const prevIdx = inlineIdx === 0 ? inline.length - 1 : inlineIdx - 1;
    const nextIdx = inlineIdx === inline.length - 1 ? 0 : inlineIdx + 1;
    inlineNav = (
      <nav aria-label="Inline-Link Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item">
            <button
              className="page-link"
              aria-label="Previous"
              type="button"
              onClick={() => setInlineIdx(prevIdx)}
            >
              <span aria-hidden="true">&laquo;</span>
              <span className="sr-only">Previous</span>
            </button>
          </li>
          {pageLinks}
          <li className="page-item">
            <button
              className="page-link"
              aria-label="Next"
              type="button"
              onClick={() => setInlineIdx(nextIdx)}
            >
              <span aria-hidden="true">&raquo;</span>
              <span className="sr-only">Next</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <div className="inlineLinks">
      {inlineNav}
      {inlineRendered}
    </div>
  );
};

SelfInline.propTypes = {
  inline: PropTypes.array.isRequired,
  load: PropTypes.bool.isRequired,
  name: PropTypes.string.isRequired,
};

export default SelfInline;
