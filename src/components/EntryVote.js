import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditVote } from '../redux/actions/reddit';

class EntryVote extends React.Component {
  render() {
    const { bearer, likes, vote, id, ups } = this.props;
    const disabled = bearer.status !== 'auth';
    const upClass = likes === true ? 'voted-up' : '';
    const upDir = likes === true ? 0 : 1;
    const downClass = likes === false ? 'voted-down' : '';
    const downDir = likes === false ? 0 : -1;
    return (
      <div className="vote">
        <button
          type="button"
          className="btn btn-link btn-sm"
          disabled={disabled}
        >
          <span
            className={`glyphicon glyphicon-thumbs-up ${upClass}`}
            aria-hidden="true"
            onClick={() => vote(`t3_${id}`, upDir)}
          />
        </button>
        <span className="small">{ups.toLocaleString()}</span>
        <button
          type="button"
          className="btn btn-link btn-sm"
          disabled={disabled}
        >
          <span
            className={`glyphicon glyphicon-thumbs-down ${downClass}`}
            aria-hidden="true"
            onClick={() => vote(`t3_${id}`, downDir)}
          />
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EntryVote);
