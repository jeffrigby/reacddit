import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class NavigationSubReddits extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentDidMount() {}

  render() {
    return <div id="NavigationSubReddits">SUBREDDITS</div>;
  }
}

NavigationSubReddits.propTypes = {};

NavigationSubReddits.defaultProps = {};

const mapStateToProps = state => ({});

const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NavigationSubReddits);
