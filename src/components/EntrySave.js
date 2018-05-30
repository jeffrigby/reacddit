import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditSave, redditUnsave } from '../redux/actions/reddit';


class EntrySave extends React.Component {
  saveUnsave() {
    return this.props.saved === true ? this.props.unsave(this.props.name) : this.props.save(this.props.name);
  }

  render() {
    const saveStr = this.props.saved === true ? 'Unsave' : 'Save';
    if (this.props.bearer.status !== 'auth') {
      return null;
    }
    return (
      <button className="btn btn-xs btn-link" onClick={() => this.saveUnsave()}>{saveStr}</button>
    );
  }
}


EntrySave.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(EntrySave);
