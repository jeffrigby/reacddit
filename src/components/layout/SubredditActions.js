import React from 'react';
import Sort from '../header/Sort';
import SortTop from '../header/SortTop';
// import Search from '../components/Search';

const SubredditActions = () => (
  <div className="subreddit-entry-filter pull-right">
    <div className="btn-group">
      <Sort />
      <SortTop />
    </div>
  </div>
);

export default SubredditActions;
