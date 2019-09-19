import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Content from '../Content';

const SelfInline = ({ inline, load, name }) => {
  const [inlineIdx, setInlineIdx] = useState(0);

  const totalLinks = inline.length;

  const prevEntry = async () => {
    const prevIdx = inlineIdx === 0 ? totalLinks - 1 : inlineIdx - 1;
    await setInlineIdx(prevIdx);
  };

  const nextEntry = () => {
    const nextIdx = inlineIdx === totalLinks - 1 ? 0 : inlineIdx + 1;
    setInlineIdx(nextIdx);
  };

  if (inline.length === 0) {
    return null;
  }

  const inlineRendered = (
    <div className="inline-render">
      <Content content={inline[inlineIdx]} load={load} data={{ name }} />
    </div>
  );

  let inlineNav;
  if (inline.length > 1) {
    inlineNav = (
      <nav aria-label="Inline-Link Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item">
            <button
              className="page-link"
              aria-label="Previous"
              type="button"
              onClick={prevEntry}
            >
              <span aria-hidden="true">&laquo;</span>
              <span className="sr-only">Previous</span>
            </button>
          </li>
          <li className="page-item">
            <span className="page-link">
              {inlineIdx + 1} / {totalLinks}
            </span>
          </li>
          <li className="page-item">
            <button
              className="page-link"
              aria-label="Next"
              type="button"
              onClick={nextEntry}
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
