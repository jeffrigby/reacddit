import React, { PropTypes } from 'react';
import Sort from '../components/Sort';
import SortTop from '../components/SortTop';
// import { connect } from 'react-redux';
// import { Link } from 'react-router';

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let renderedHeader;
        if (!this.props.accessToken) {
            renderedHeader = (<nav className="navbar navbar-inverse navbar-fixed-top row" role="navigation" id="header">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 hidden-print hidden-xs hidden-sm" role="complementary"
                             id="right-sidebar" style={{color: 'white'}}>
                            <span className="navbar-brand">RedditJS</span>
                        </div>
                        <div className="col-xs-12 col-md-9 col-lg-10">
                            <ul className="nav navbar-nav navbar-right">
                                <li>
                                    <div className="btn-group">
                                        <a className="btn btn-default btn-sm navbar-btn" href="/api/reddit-login">Reddit Sign in</a>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>);
        } else {
            const sort = this.props.params.sort ? this.props.params.sort : 'hot';
            const sortTop = this.props.query.t ? this.props.query.t : 'day';
            const subreddit = this.props.params.subreddit ? this.props.params.subreddit : 'mine';
            renderedHeader = (<nav className="navbar navbar-inverse navbar-fixed-top row" role="navigation" id="header">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-3 col-lg-2 hidden-print hidden-xs hidden-sm" role="complementary"
                             id="right-sidebar" style={{color: 'white'}}>
                            <span className="navbar-brand">RedditJS</span>
                        </div>
                        <div className="col-xs-12 col-md-9 col-lg-10">
                            <ul className="nav navbar-nav">
                                <li style={{'minWidth': '300px'}}>
                                    SUBREDDIT
                                </li>
                                <li>
                                    UNSUB {subreddit}
                                </li>
                                <li>
                                    <Sort sort={sort} subreddit={subreddit}/>
                                </li>
                                <li>
                                    <SortTop sort={sort} sortTop={sortTop} subreddit={subreddit}/>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>);
        }

        return renderedHeader;
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
