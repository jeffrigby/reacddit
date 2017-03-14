import React, { PropTypes } from 'react';
import Sort from '../components/Sort';
import SortTop from '../components/SortTop';

class SubredditActions extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const subreddit = this.props.params.subreddit ? this.props.params.subreddit : 'mine';
        return (
            <div className="subreddit-entry-filter">
                <div className="btn-group">
                    <Sort subreddit={subreddit}/>
                    <SortTop subreddit={subreddit}/>
                </div>
            </div>
        );
    }
}

SubredditActions.propTypes = {
    params: PropTypes.object,
    query: PropTypes.object,
    accessToken: PropTypes.object
};

export default SubredditActions;
