import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import Listings from './Listings';
import NotFound404 from '../../NotFound404';

function ListingsRoute({ overrides, validations }) {
  const match = useParams();

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

ListingsRoute.defaultProps = {
  // settings: { debug: false, view: 'expanded' },
  overrides: {},
  validations: {},
};

export default ListingsRoute;
