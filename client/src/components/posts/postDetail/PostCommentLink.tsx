import { Link } from 'react-router-dom';

function abbr(value: number): string | number {
  let newValue: number | string = value;
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let suffixNum = 0;
  while (newValue >= 1000) {
    newValue /= 1000;
    suffixNum += 1;
    newValue = Number(newValue.toPrecision(2));
  }

  newValue = newValue + suffixes[suffixNum];
  return newValue;
}

interface PostCommentLinkProps {
  numComments: number;
  permalink: string;
}

function PostCommentLink({
  numComments,
  permalink,
}: PostCommentLinkProps): React.JSX.Element {
  // const commentCount = parseFloat(numComments).toLocaleString('en');
  const commentCount = abbr(parseFloat(numComments.toString()));
  return (
    <Link
      to={{
        pathname: permalink,
        state: {
          showBack: true,
        },
      }}
    >
      <i className="far fa-comment" /> {commentCount}
    </Link>
  );
}

export default PostCommentLink;
