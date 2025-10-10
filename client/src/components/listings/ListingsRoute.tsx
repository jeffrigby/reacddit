import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { useAppDispatch } from '@/redux/hooks';
import { setHistory } from '../../redux/slices/historySlice';
import Listings from './Listings';
import NotFound404 from '../../NotFound404';

interface ListingsRouteProps {
  overrides?: Record<string, string>;
  validations?: Record<string, string[]>;
}

function ListingsRoute({
  overrides = {},
  validations = {},
}: ListingsRouteProps) {
  const match = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setHistory(location));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const overrideMatch = { ...match, ...overrides };

  const validated = Object.keys(validations).every(
    (key) => overrideMatch[key] && validations[key].includes(overrideMatch[key])
  );

  if (!validated) {
    return <NotFound404 />;
  }

  return <Listings match={overrideMatch} />;
}

export default ListingsRoute;
