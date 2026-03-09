import { useLocation } from 'react-router';
import { useAppSelector } from '@/redux/hooks';
import { selectListingStatus } from '@/redux/slices/listingsSlice';
import ListingsHeaderSub from './ListingsHeaderSub';
import ListingsHeaderMulti from './ListingsHeaderMulti';
import ListingsHeaderError from './ListingsHeaderError';

function ListingsHeader() {
  const listType = useAppSelector(
    (state) => state.listings.currentFilter?.listType
  );
  const location = useLocation();
  const status = useAppSelector((state) =>
    selectListingStatus(state, location.key)
  );

  if (listType === 'comments' || listType === 'duplicates') {
    return null;
  }

  let header: React.ReactElement;
  switch (status) {
    case 'error':
      header = <ListingsHeaderError />;
      break;
    default:
      header =
        listType === 'm' ? <ListingsHeaderMulti /> : <ListingsHeaderSub />;
  }

  return <div className="list-group-item listings-header">{header}</div>;
}

export default ListingsHeader;
