import { memo, type MouseEvent } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

interface SearchSubscribeProps {
  displayName: string;
  pending: boolean;
  onSubscribe: () => void;
}

// Swallowing mousedown keeps the filter box focused through the click.
function keepFocus(event: MouseEvent<HTMLButtonElement>): void {
  event.preventDefault();
}

/** Subscribe control for a search result row. */
function SearchSubscribe({
  displayName,
  pending,
  onSubscribe,
}: SearchSubscribeProps): React.JSX.Element {
  const label = `Subscribe to r/${displayName}`;

  return (
    <Button
      aria-label={label}
      className="m-0 p-0 ms-1 faded"
      disabled={pending}
      size="sm"
      title={label}
      variant="link"
      onClick={onSubscribe}
      onMouseDown={keepFocus}
    >
      <FontAwesomeIcon
        className={pending ? 'opacity-50' : ''}
        icon={faPlusCircle}
      />
    </Button>
  );
}

export default memo(SearchSubscribe);
