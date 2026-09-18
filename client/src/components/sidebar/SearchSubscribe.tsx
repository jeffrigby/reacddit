import { useState, type MouseEvent, type ReactElement } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { useAppSelector } from '@/redux/hooks';
import { useSubscribeToSubredditMutation } from '@/redux/api';

interface SearchSubscribeProps {
  /** Fullname of the subreddit, such as t5_2qh0u */
  name: string;
  displayName: string;
}

/**
 * Subscribe control for a search result row. A successful call invalidates
 * the subscribed list, which refetches and drops this row out of the results,
 * so the control stays disabled until its row goes with it.
 */
function SearchSubscribe({
  name,
  displayName,
}: SearchSubscribeProps): ReactElement | null {
  const auth = useAppSelector((state) => state.redditBearer.status === 'auth');
  const [subscribeToSubreddit] = useSubscribeToSubredditMutation();
  const [pending, setPending] = useState(false);

  if (!auth) {
    return null;
  }

  const subscribe = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPending(true);
    try {
      await subscribeToSubreddit({ name, action: 'sub', type: 'sr' }).unwrap();
    } catch (error) {
      console.error('Subscribe failed:', error);
      setPending(false);
    }
  };

  const label = `Subscribe to r/${displayName}`;

  return (
    <Button
      aria-label={label}
      className="m-0 p-0 ms-1 search-subscribe"
      disabled={pending}
      size="sm"
      title={label}
      variant="link"
      onClick={subscribe}
      onMouseDown={(event) => {
        event.preventDefault();
      }}
    >
      <FontAwesomeIcon
        className={pending ? 'opacity-50' : ''}
        icon={faPlusCircle}
      />
    </Button>
  );
}

export default SearchSubscribe;
