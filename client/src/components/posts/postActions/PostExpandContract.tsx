import { memo } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretRight,
  faCompressArrowsAlt,
  faExpandArrowsAlt,
} from '@fortawesome/free-solid-svg-icons';

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

  // Determine the appropriate icon based on content type and state
  let expandIcon;
  let iconClassName = '';

  if (isComment) {
    expandIcon = expand ? faCaretDown : faCaretRight;
    iconClassName = 'menu-caret';
  } else {
    expandIcon = expand ? faCompressArrowsAlt : faExpandArrowsAlt;
  }

  // More descriptive accessibility labels without keyboard shortcut notation
  const viewTitle = isComment
    ? expand
      ? 'Collapse comment'
      : 'Expand comment'
    : expand
      ? 'Collapse post'
      : 'Expand post';

  return (
    <Button
      aria-label={viewTitle}
      className="shadow-none m-0 p-0"
      size="sm"
      title={viewTitle}
      variant="link"
      onClick={toggleView}
    >
      <FontAwesomeIcon className={iconClassName} icon={expandIcon} />
    </Button>
  );
}

export default memo(PostExpandContract);
