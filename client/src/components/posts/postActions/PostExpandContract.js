import { memo } from 'react';
import PropTypes from 'prop-types';

function PostExpandContract({ expand, toggleView, kind }) {
  let viewIcon;
  if (kind === 't1') {
    viewIcon = expand
      ? 'fas fa-caret-down menu-caret'
      : 'fas fa-caret-right menu-caret';
  } else {
    viewIcon = expand
      ? 'fas fa-compress-arrows-alt'
      : 'fas fa-expand-arrows-alt';
  }

  const viewTitle = expand ? 'Close this post (x)' : 'Open this post (x)';

  return (
    <button
      onClick={toggleView}
      type="button"
      className="btn btn-link btn-sm shadow-none m-0 p-0"
      title={viewTitle}
    >
      <i className={viewIcon} />
    </button>
  );
}

PostExpandContract.propTypes = {
  expand: PropTypes.bool.isRequired,
  toggleView: PropTypes.func.isRequired,
  kind: PropTypes.string.isRequired,
};

export default memo(PostExpandContract);
