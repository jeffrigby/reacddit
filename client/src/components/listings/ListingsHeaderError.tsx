import { useAppSelector } from '@/redux/hooks';

function ListingsHeaderError() {
  const target = useAppSelector((state) => state.listingsFilter?.target);

  return (
    <div className="d-flex">
      <div className="me-auto title-contrainer">
        <h5 className="m-0 p-0 w-100">Error Loading {target}</h5>
      </div>
    </div>
  );
}

export default ListingsHeaderError;
