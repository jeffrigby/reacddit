import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Content from '../Content';

function SelfInline({ inline, inlineLinks, name }) {
  const [inlineIdx, setInlineIdx] = useState(0);
  const [resolvedContent, setResolvedContent] = useState([]);

  useEffect(() => {
    Promise.all(inline).then((content) => {
      const resolved = [];
      content.forEach((value, key) => {
        if (value) {
          resolved.push({
            content: value,
            link: inlineLinks[key],
          });
        }
      });
      setResolvedContent(resolved);
    });
  }, [inline, inlineLinks]);

  const totalLinks = resolvedContent.length;
  if (!totalLinks) return '';

  const prevEntry = async () => {
    const prevIdx = inlineIdx === 0 ? totalLinks - 1 : inlineIdx - 1;
    await setInlineIdx(prevIdx);
  };

  const nextEntry = () => {
    const nextIdx = inlineIdx === totalLinks - 1 ? 0 : inlineIdx + 1;
    setInlineIdx(nextIdx);
  };

  if (resolvedContent.length === 0) {
    return null;
  }

  const inlineKey = `${name}-${inlineIdx}`;
  const inlineLink = resolvedContent[inlineIdx].link;

  const inlineRendered = resolvedContent[inlineIdx].content ? (
    <div className="inline-render">
      <Content
        content={resolvedContent[inlineIdx].content}
        data={{ name }} // Just pass the name.
        key={inlineKey}
      />
    </div>
  ) : (
    'Embed Failed'
  );

  let inlineNav;
  if (inline.length > 1) {
    inlineNav = (
      <nav aria-label="Inline-Link Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className="page-item">
            <button
              className="page-link shadow-none"
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
              className="page-link shadow-none"
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
      <div className="small">
        Source:{' '}
        <a href={inlineLink} target="_blank" rel="noreferrer">
          {inlineLink}
        </a>
      </div>
    </div>
  );
}

SelfInline.propTypes = {
  inline: PropTypes.array.isRequired,
  inlineLinks: PropTypes.array.isRequired,
  name: PropTypes.string.isRequired,
};

export default SelfInline;
