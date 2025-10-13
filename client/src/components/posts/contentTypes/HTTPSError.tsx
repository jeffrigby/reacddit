import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import type { HTTPSErrorContent } from './types';

interface HTTPSErrorProps {
  content: HTTPSErrorContent;
}

function HTTPSError({ content }: HTTPSErrorProps) {
  const { src } = content;
  return (
    <div className="self">
      <p>
        <FontAwesomeIcon icon={faExclamationCircle} /> Link is not HTTPS. Click{' '}
        <a href={src} rel="noreferrer" target="_blank">
          here
        </a>{' '}
        to load the link in a new window.
      </p>
    </div>
  );
}

export default HTTPSError;
