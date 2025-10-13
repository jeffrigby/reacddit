import { formatDistanceToNow } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-regular-svg-icons';

interface PostTimeAgoProps {
  createdUtc: number;
}

function PostTimeAgo({ createdUtc }: PostTimeAgoProps): React.JSX.Element {
  const timeago = formatDistanceToNow(createdUtc * 1000);
  // gotta be a better way to do this, but, whatever
  const timeagoshort = timeago
    .replace(/less than a minute?/g, '<1M')
    .replace(/seconds?/g, 'S')
    .replace(/minutes?/g, 'M')
    .replace(/hours?/g, 'H')
    .replace(/days?/g, 'D')
    .replace(/months?/g, 'MO')
    .replace(/years?/g, 'Y')
    .replace(/over/g, '>')
    .replace(/about/g, '')
    .replace(/almost/g, '')
    .replace(/ /g, '');

  return (
    <>
      <FontAwesomeIcon icon={faClock} /> {timeagoshort}
    </>
  );
}

export default PostTimeAgo;
