import React, { PropTypes } from 'react';
import Sort from '../components/Sort';
import SortTop from '../components/SortTop';
// import { connect } from 'react-redux';
// import { Link } from 'react-router';

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    showSubs() {
        jQuery('.row-offcanvas').toggleClass('active');
    }

    render() {
        const sort = this.props.params.sort ? this.props.params.sort : 'hot';
        const sortTop = this.props.query.t ? this.props.query.t : 'day';
        const subreddit = this.props.params.subreddit ? this.props.params.subreddit : 'mine';
        return (
            <div className="navbar navbar-inverse navbar-fixed-top">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <button type="button" className="btn btn-primary btn-xs navbar-toggle" data-toggle="offcanvas" onClick={this.showSubs}>
                        <i className="glyphicon glyphicon-chevron-left"></i>
                    </button>
                    <a className="navbar-brand" href="#">RedditJS</a>
                </div>


                <div className="collapse navbar-collapse">
                    <div className="btn-group">
                        <Sort sort={sort} subreddit={subreddit}/>
                        <SortTop sort={sort} sortTop={sortTop} subreddit={subreddit}/>
                    </div>
                </div>
            </div>
            );
    }
}

Header.propTypes = {
    params: PropTypes.object,
    query: PropTypes.object,
    accessToken: PropTypes.object
};

export default Header;

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
// )(Header);
