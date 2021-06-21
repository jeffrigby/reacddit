import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ListingsHeaderSub from './ListingsHeaderSub';
import ListingsHeaderMulti from './ListingsHeaderMulti';
import { listingStatus } from '../../redux/selectors/listingsSelector';
import ListingsHeaderError from './ListingsHeaderError';

const ListingsHeader = ({ filter, status }) => {
  const { listType } = filter;

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

ListingsHeader.propTypes = {
  filter: PropTypes.object.isRequired,
  status: PropTypes.string.isRequired,
};

ListingsHeader.defaultProps = {};

const mapStateToProps = (state) => ({
  filter: state.listingsFilter,
  status: listingStatus(state),
});

export default connect(mapStateToProps, {})(ListingsHeader);
