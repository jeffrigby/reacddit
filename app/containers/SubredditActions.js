import React, { PropTypes } from 'react';
import Sort from '../components/Sort';
import SortTop from '../components/SortTop';
// import { connect } from 'react-redux';
// import { Link } from 'react-router';

class SubredditActions extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const sort = this.props.params.sort ? this.props.params.sort : 'hot';
        const sortTop = this.props.query.t ? this.props.query.t : 'day';
        const subreddit = this.props.params.subreddit ? this.props.params.subreddit : 'mine';
        return (
            <div className="subreddit-entry-filter">
                <h5>{subreddit}</h5>
                <div className="btn-group">
                    <Sort sort={sort} subreddit={subreddit}/>
                    <SortTop sort={sort} sortTop={sortTop} subreddit={subreddit}/>
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

// const mapStateToProps = (state) => {
//     return {
//         // routing: state.routing,
//         // sort: state.sort,
//         // subreddit: state.subreddit
//     };
// };
//
// const mapDispatchToProps = (dispatch) => {
//     return {
//         // onSortTopChange: sortTop => dispatch(storeSortTop(sortTop)),
//         // onSortChange: sort => dispatch(storeSort(sort))
//     };
// };
//
// export default connect(
//     mapStateToProps,
//     mapDispatchToProps
// )(SubredditActions);
