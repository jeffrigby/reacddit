import { Link } from 'react-router-dom';

interface PostSubLinkProps {
  subreddit: string;
}

function PostSubLink({ subreddit }: PostSubLinkProps): React.JSX.Element {
  return (
    <Link state={{ showBack: true }} to={`/r/${subreddit}`}>
      /r/{subreddit}
    </Link>
  );
}

export default PostSubLink;
