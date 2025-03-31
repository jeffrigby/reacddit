import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setHistory } from '../../redux/slices/historySlice';
import Listings from './Listings';
import NotFound404 from '../../NotFound404';

function ListingsRoute({ overrides = {}, validations = {} }) {
  const match = useParams();
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setHistory(location));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const overrideMatch = { ...match, ...overrides };

  let validated = true;
  Object.keys(validations).every((key) => {
    if (overrideMatch[key] && validations[key].includes(overrideMatch[key])) {
      validated = true;
      return true;
    }
    validated = false;
    return false;
  });

  if (!validated) {
    return <NotFound404 />;
  }

  return <Listings match={overrideMatch} />;
}

ListingsRoute.propTypes = {
  overrides: PropTypes.object,
  validations: PropTypes.object,
};

export default ListingsRoute;
