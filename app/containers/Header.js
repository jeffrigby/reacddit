import React, { PropTypes } from 'react';
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
