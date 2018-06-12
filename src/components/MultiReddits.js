import React from 'react';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { redditFetchMultis } from '../redux/actions/reddit';
import RedditAPI from '../reddit/redditAPI';

class MultiReddits extends React.Component {
  constructor(props) {
    super(props);
    this.accessToken = null;
  }

  async componentDidMount() {
    this.accessToken = await RedditAPI.getToken();

    if (this.accessToken) {
      this.props.fetchMultis();
    }
  }

  generateMultiItems() {
    const { multis } = this.props.multireddits;
    const navigationItems = [];

    if (multis) {
      multis.forEach((item) => {
        navigationItems.push(
          <li key={item.data.path}>
            <div>
              <NavLink
                to={item.data.path}
                title={item.data.description_md}
                activeClassName="activeSubreddit"
              >{item.data.name}
              </NavLink>
            </div>
          </li>);
      });
    }

    return navigationItems;
  }

  render() {
    if (this.props.multireddits) {
      const multis = this.generateMultiItems();
      if (multis.length) {
        return (
          <div>
            <div><strong>Multis</strong></div>
            <ul className="nav">{multis}</ul>
            <div className="nav-divider" />
          </div>
        );
      }
      return (<div />);
    }
    return (<div />);
  }
}


MultiReddits.propTypes = {
  fetchMultis: PropTypes.func.isRequired,
  // push: PropTypes.func.isRequired,
  multireddits: PropTypes.object.isRequired,
  // debug: PropTypes.bool.isRequired,
  // disableHotkeys: PropTypes.bool.isRequired,
};

MultiReddits.defaultProps = {
};

const mapStateToProps = state => ({
  multireddits: state.redditMultiReddits,
  debug: state.debugMode,
  disableHotkeys: state.disableHotKeys,
});

const mapDispatchToProps = dispatch => ({
  fetchMultis: () => dispatch(redditFetchMultis()),
  // setDebug: debug => dispatch(debugMode(debug)),
  push: url => dispatch(push(url)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MultiReddits);
