import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditVote } from '../redux/actions/reddit';

class EntryVote extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  shouldComponentUpdate(nextProps, nextState) {
    return true;
  }

  render() {
    const disabled = (this.props.bearer.status !== 'auth');
    const upClass = this.props.likes === true ? 'voted-up' : '';
    const upDir = this.props.likes === true ? 0 : 1;
    const downClass = this.props.likes === false ? 'voted-down' : '';
    const downDir = this.props.likes === false ? 0 : -1;
    return (
      <div className="vote">
        <button type="button" className="btn btn-link btn-sm" disabled={disabled}>
          <span className={`glyphicon glyphicon-thumbs-up ${upClass}`} aria-hidden="true" onClick={() => this.props.vote(`t3_${this.props.id}`, upDir)} />
        </button>
        <span className="small">{this.props.ups.toLocaleString()}</span>
        <button type="button" className="btn btn-link btn-sm" disabled={disabled}>
          <span className={`glyphicon glyphicon-thumbs-down ${downClass}`} aria-hidden="true" onClick={() => this.props.vote(`t3_${this.props.id}`, downDir)} />
        </button>
      </div>
    );
  }
}


EntryVote.propTypes = {
  id: PropTypes.string.isRequired,
  ups: PropTypes.number.isRequired,
  likes: PropTypes.bool,
  vote: PropTypes.func.isRequired,
  bearer: PropTypes.object.isRequired,
};

EntryVote.defaultProps = {
  likes: null,
};

const mapStateToProps = state => ({
  bearer: state.redditBearer,
});

const mapDispatchToProps = dispatch => ({
  vote: (id, dir) => dispatch(redditVote(id, dir)),
});

export default connect(mapStateToProps, mapDispatchToProps)(EntryVote);
