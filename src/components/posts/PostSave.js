import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditSave, redditUnsave } from '../../redux/actions/reddit';

class PostSave extends React.Component {
  saveUnsave() {
    const { saved, unsave, name, save } = this.props;
    return saved === true ? unsave(name) : save(name);
  }

  render() {
    const { saved, bearer } = this.props;
    const saveStr =
      saved === true ? (
        <i className="fas fa-bookmark" />
      ) : (
        <i className="far fa-bookmark" />
      );
    const title = saved === true ? 'Unsave Post' : 'Save Post';

    if (bearer.status !== 'auth') {
      return null;
    }
    return (
      <div id="entry-save">
        <button
          className="btn btn-link btn-sm m-0 p-0"
          onClick={() => this.saveUnsave()}
          type="button"
          title={title}
        >
          {saveStr}
        </button>
      </div>
    );
  }
}

PostSave.propTypes = {
  name: PropTypes.string.isRequired,
  saved: PropTypes.bool.isRequired,
  save: PropTypes.func.isRequired,
  unsave: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

// EntrySave.defaultProps = {
//   likes: null,
// };

const mapStateToProps = state => ({
  bearer: state.redditBearer,
});

const mapDispatchToProps = dispatch => ({
  save: id => dispatch(redditSave(id)),
  unsave: id => dispatch(redditUnsave(id)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostSave);
