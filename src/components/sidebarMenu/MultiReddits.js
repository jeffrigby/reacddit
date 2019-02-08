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
      loading: true,
    };
    this.reloadMultis = this.reloadMultis.bind(this);
  }

  async componentDidMount() {
    const { fetchMultis } = this.props;
    this.accessToken = await RedditAPI.getToken(false);

    if (this.accessToken && this.accessToken.substr(0, 1) !== '-') {
      await fetchMultis();
      this.setState({ loading: false });
    }
  }

  async reloadMultis() {
    const { fetchMultis } = this.props;
    this.setState({ loading: true });
    await fetchMultis(true);
    this.setState({ loading: false });
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
    const { loading } = this.state;
    if (multireddits) {
      const multis = this.generateMultiItems();
      if (multis.length) {
        let spinnerClass = 'fas fa-sync-alt reload';
        let multisClass = 'nav flex-column';

        if (loading) {
          spinnerClass += ' fa-spin';
          multisClass += ' faded';
        }

        return (
          <div id="sidebar-multis">
            <div className="sidebar-heading d-flex text-muted">
              <span className="mr-auto">Multis</span>
              <span>
                <i
                  className={spinnerClass}
                  onClick={this.reloadMultis}
                  role="button"
                  tabIndex="0"
                  onKeyDown={this.reloadMultis}
                />
              </span>
            </div>
            <ul className={multisClass}>{multis}</ul>
          </div>
        );
      }
      return null;
    }
    return null;
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
  fetchMultis: reset => dispatch(redditFetchMultis(reset)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiReddits);
