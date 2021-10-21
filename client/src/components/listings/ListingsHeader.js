import { useSelector } from 'react-redux';
import ListingsHeaderSub from './ListingsHeaderSub';
import ListingsHeaderMulti from './ListingsHeaderMulti';
import { listingStatus } from '../../redux/selectors/listingsSelector';
import ListingsHeaderError from './ListingsHeaderError';

const ListingsHeader = () => {
  const listType = useSelector((state) => state.listingsFilter?.listType);
  const status = useSelector((state) => listingStatus(state));

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
};

export default ListingsHeader;
