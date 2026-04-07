import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { sanitizeHref } from '@/utils/sanitize';
import type { HttpsErrorContent } from '@/components/posts/embeds/types';

interface HTTPSErrorProps {
  content: HttpsErrorContent;
}

function HTTPSError({ content }: HTTPSErrorProps) {
  const { src } = content;
  return (
    <div className="self">
      <p>
        <FontAwesomeIcon icon={faExclamationCircle} /> Link is not HTTPS. Click{' '}
        <a
          href={src ? sanitizeHref(src) : undefined}
          rel="noreferrer"
          target="_blank"
        >
          here
        </a>{' '}
        to load the link in a new window.
      </p>
    </div>
  );
}

export default HTTPSError;
