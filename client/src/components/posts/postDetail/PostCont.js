import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Post from './Post';
import { postData } from '../../../redux/selectors/postSelectors';

const PostCont = ({ post, postName, duplicate }) => {
  return <Post postName={postName} post={post} duplicate={duplicate} />;
};

PostCont.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  postName: PropTypes.string.isRequired,
  // eslint-disable-next-line react/no-unused-prop-types
  idx: PropTypes.number.isRequired,
  post: PropTypes.object.isRequired,
  duplicate: PropTypes.bool,
};

PostCont.defaultProps = {
  duplicate: false,
};

const mapStateToProps = (state, props) => ({
  post: postData(state, props),
});

export default connect(mapStateToProps, {}, null)(PostCont);
