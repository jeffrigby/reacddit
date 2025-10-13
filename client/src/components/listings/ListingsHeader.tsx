import { useLocation } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import ListingsHeaderSub from './ListingsHeaderSub';
import ListingsHeaderMulti from './ListingsHeaderMulti';
import ListingsHeaderError from './ListingsHeaderError';
import { listingStatus } from '../../redux/selectors/listingsSelector';

function ListingsHeader() {
  const listType = useAppSelector(
    (state) => state.listings.currentFilter?.listType
  );
  const location = useLocation();
  const status = useAppSelector((state) => listingStatus(state, location.key));

  let header;
  if (status === 'error') {
    header = <ListingsHeaderError />;
  } else if (listType === 'm') {
    header = <ListingsHeaderMulti />;
  } else if (listType === 'comments' || listType === 'duplicates') {
    return null;
  } else {
    header = <ListingsHeaderSub />;
  }

  return <div className="list-group-item listings-header">{header}</div>;
}

export default ListingsHeader;
