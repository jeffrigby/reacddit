import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { redditFetchMultis } from '../../redux/actions/reddit';
import RedditAPI from '../../reddit/redditAPI';
import MultiRedditsItem from './MultiRedditsItem';

class MultiReddits extends React.Component {
  constructor(props) {
    super(props);
    this.accessToken = null;
    this.state = {
      showSubs: false,
    };
    this.hideShowSubs = this.hideShowSubs.bind(this);
  }

  async componentDidMount() {
    const { fetchMultis } = this.props;
    this.accessToken = await RedditAPI.getToken(false);

    if (this.accessToken && this.accessToken.substr(0, 1) !== '-') {
      fetchMultis();
    }
  }

  hideShowSubs() {
    const { showSubs } = this.state;
    this.setState({ showSubs: !showSubs });
  }

  generateMultiItems() {
    const { multireddits } = this.props;
    const navigationItems = [];

    if (multireddits.multis) {
      multireddits.multis.forEach(item => {
        const key = `${item.data.display_name}-${item.data.created}`;
        navigationItems.push(<MultiRedditsItem item={item} key={key} />);
      });
    }

    return navigationItems;
  }

  render() {
    const { multireddits } = this.props;
    if (multireddits) {
      const multis = this.generateMultiItems();
      if (multis.length) {
        return (
          <div>
            <div className="sidebar-heading d-flex text-muted">
              <span className="mr-auto">Multis</span>
              <span>
                <i
                  className="fas fa-sync-alt"
                  onClick={this.reloadSubredditsClick}
                  role="button"
                  tabIndex="0"
                  onKeyDown={this.reloadSubredditsClick}
                />
              </span>
            </div>
            <ul className="nav flex-column">{multis}</ul>
            <div className="nav-divider" />
          </div>
        );
      }
      return <div />;
    }
    return <div />;
  }
}

MultiReddits.propTypes = {
  fetchMultis: PropTypes.func.isRequired,
  multireddits: PropTypes.object.isRequired,
};

MultiReddits.defaultProps = {};

const mapStateToProps = state => ({
  multireddits: state.redditMultiReddits,
});

const mapDispatchToProps = dispatch => ({
  fetchMultis: () => dispatch(redditFetchMultis()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiReddits);
