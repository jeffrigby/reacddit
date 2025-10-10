import { Link } from 'react-router-dom';

interface PostSubLinkProps {
  subreddit: string;
}

function PostSubLink({ subreddit }: PostSubLinkProps): React.JSX.Element {
  return (
    <Link to={{ pathname: `/r/${subreddit}`, state: { showBack: true } }}>
      /r/{subreddit}
    </Link>
  );
}

export default PostSubLink;
