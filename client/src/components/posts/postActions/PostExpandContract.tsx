import { memo } from 'react';
import classNames from 'classnames';

/**
 * Reddit kind types that this component handles
 * - 't1' represents comments
 * - Other values represent posts (t3_*)
 */
type RedditExpandableKind = 't1' | string;

interface PostExpandContractProps {
  /** Whether the post/comment is currently expanded */
  expand: boolean;
  /** Callback to toggle the expanded state */
  toggleView: () => void;
  /** Reddit kind identifier - 't1' for comments, others for posts */
  kind: RedditExpandableKind;
}

/**
 * PostExpandContract - A button component that toggles the expanded/collapsed state
 * of Reddit posts and comments. Shows different icons based on the content type.
 *
 * For comments (t1): Shows caret right/down icons
 * For posts: Shows expand/compress arrows icons
 */
function PostExpandContract({
  expand,
  toggleView,
  kind,
}: PostExpandContractProps) {
  const isComment = kind === 't1';

  const viewIcon = classNames({
    fas: true,
    'fa-caret-down menu-caret': isComment && expand,
    'fa-caret-right menu-caret': isComment && !expand,
    'fa-compress-arrows-alt': !isComment && expand,
    'fa-expand-arrows-alt': !isComment && !expand,
  });

  // More descriptive accessibility labels without keyboard shortcut notation
  const viewTitle = isComment
    ? expand
      ? 'Collapse comment'
      : 'Expand comment'
    : expand
      ? 'Collapse post'
      : 'Expand post';

  return (
    <button
      aria-label={viewTitle}
      className="btn btn-link btn-sm shadow-none m-0 p-0"
      title={viewTitle}
      type="button"
      onClick={toggleView}
    >
      <i className={viewIcon} />
    </button>
  );
}

export default memo(PostExpandContract);
