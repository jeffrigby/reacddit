import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import NavigationItem from './NavigationItem';

class MultiRedditsSubs extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  getSortedNavItems() {
    const { multiRedditSubs } = this.props;
    const multiRedditSubsKeyed = {};

    Object.keys(multiRedditSubs).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(multiRedditSubs, key)) {
        const item = multiRedditSubs[key].data;
        multiRedditSubsKeyed[item.display_name.toLowerCase()] = item;
      }
    });

    const subredditsOrdered = {};
    Object.keys(multiRedditSubsKeyed)
      .sort()
      .forEach(key => {
        subredditsOrdered[key] = multiRedditSubsKeyed[key];
      });

    return subredditsOrdered;
  }

  generateNavItems(subreddits) {
    const subredditsOrdered = this.getSortedNavItems();
    const { lastUpdated } = this.props;
    const navigationItems = [];
    Object.keys(subredditsOrdered).forEach((key, index) => {
      if (Object.prototype.hasOwnProperty.call(subredditsOrdered, key)) {
        const item = subredditsOrdered[key];
        const trigger = false;

        const subLastUpdated = lastUpdated[item.name]
          ? lastUpdated[item.name]
          : 0;

        navigationItems.push(
          <NavigationItem
            item={item}
            key={item.name}
            lastUpdated={subLastUpdated}
            trigger={trigger}
          />
        );
      }
    });
    return navigationItems;
  }

  render() {
    const { multiRedditSubs } = this.props;
    const navItems = this.generateNavItems(multiRedditSubs);
    if (multiRedditSubs) {
      return <ul className="nav subnav">{navItems}</ul>;
    }
    return <div />;
  }
}

MultiRedditsSubs.propTypes = {
  multiRedditSubs: PropTypes.array.isRequired,
  lastUpdated: PropTypes.object.isRequired,
};

MultiRedditsSubs.defaultProps = {
};

const mapStateToProps = state => ({
  lastUpdated: state.lastUpdated,
});

const mapDispatchToProps = dispatch => ({
  // push: url => dispatch(push(url)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MultiRedditsSubs);
