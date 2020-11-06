import React from 'react';
import PropTypes from 'prop-types';
import NavigationItem from './NavigationItem';

const genNavItems = (multiRedditSubs) => {
  const navigationItems = [];
  const multiRedditSubsKeyed = multiRedditSubs.reduce((obj, subreddit) => {
    obj[subreddit.data.display_name.toLowerCase()] = subreddit.data; // eslint-disable-line no-param-reassign
    return obj;
  }, {});

  Object.keys(multiRedditSubsKeyed)
    .sort()
    .forEach((key, index) => {
      const item = multiRedditSubsKeyed[key];
      const trigger = false;

      navigationItems.push(
        <NavigationItem item={item} key={item.name} trigger={trigger} />
      );
    });

  return navigationItems;
};

const MultiRedditsSubs = ({ multiRedditSubs }) => {
  if (multiRedditSubs) {
    const navItems = genNavItems(multiRedditSubs);
    return <ul className="nav subnav pl-2">{navItems}</ul>;
  }
  return <div />;
};

MultiRedditsSubs.propTypes = {
  multiRedditSubs: PropTypes.array.isRequired,
};

export default MultiRedditsSubs;
