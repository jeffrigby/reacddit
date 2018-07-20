import React from 'react';
import Sort from '../components/Sort';
import SortTop from '../components/SortTop';

const SubredditActions = () => (
  <div className="subreddit-entry-filter">
    <div className="btn-group">
      <Sort />
      <SortTop />
    </div>
  </div>
);

export default SubredditActions;
