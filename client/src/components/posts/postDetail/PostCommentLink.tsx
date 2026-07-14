import { Link } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { useDetailNavState } from '@/hooks/useDetailNavState';

function abbr(value: number): string {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let newValue = value;
  let suffixNum = 0;

  while (newValue >= 1000 && suffixNum < suffixes.length - 1) {
    newValue /= 1000;
    suffixNum += 1;
  }

  const formatted = suffixNum > 0 ? Number(newValue.toPrecision(2)) : newValue;

  return `${formatted}${suffixes[suffixNum]}`;
}

interface PostCommentLinkProps {
  numComments: number;
  permalink: string;
}

function PostCommentLink({
  numComments,
  permalink,
}: PostCommentLinkProps): React.JSX.Element {
  const detailNavState = useDetailNavState();
  const commentCount = abbr(numComments);
  return (
    <Link state={detailNavState} to={permalink}>
      <FontAwesomeIcon icon={faComment} /> {commentCount}
    </Link>
  );
}

export default PostCommentLink;
