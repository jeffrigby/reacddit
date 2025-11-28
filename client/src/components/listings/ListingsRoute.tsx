import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router';
import { useAppDispatch } from '@/redux/hooks';
import { historyPathAdded } from '@/redux/slices/historySlice';
import NotFound404 from '@/NotFound404';
import Listings from './Listings';

interface RouteOverrides {
  listType?: string;
  sort?: string;
  target?: string;
  user?: string;
  userType?: string;
  multi?: string | boolean;
  postName?: string;
  comment?: string;
}

interface ListingsRouteProps {
  overrides?: RouteOverrides;
  validations?: Record<string, string[] | string | undefined>;
}

function ListingsRoute({
  overrides = {},
  validations = {},
}: ListingsRouteProps) {
  const match = useParams();
  const location = useLocation();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Track the current path in history
    dispatch(historyPathAdded(location.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const overrideMatch = { ...match, ...overrides };

  const validated = Object.keys(validations).every((key) => {
    const validation = validations[key];
    const value = overrideMatch[key];

    if (!value) {
      return false;
    }

    // If validation is a string, check for exact match
    if (typeof validation === 'string') {
      return value === validation;
    }

    // If validation is an array, check if value is included
    if (Array.isArray(validation)) {
      return validation.includes(value as string);
    }

    return false;
  });

  if (!validated) {
    return <NotFound404 />;
  }

  return <Listings match={overrideMatch} />;
}

export default ListingsRoute;
