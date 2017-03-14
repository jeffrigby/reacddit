import React, { PropTypes } from 'react';
import SubredditActions from '../containers/SubredditActions';
import { connect } from 'react-redux';

class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    showSubs() {
        jQuery('.row-offcanvas').toggleClass('active');
    }

    render() {
        const target = this.props.listingsTarget === 'mine' ? 'RedditJS' : this.props.listingsTarget;
        return (
            <div className="navbar navbar-inverse navbar-fixed-top" id="header">
                <div id="header-sidebar">
                    <div className="col-md-12">
                        <h5 className="header-target">{target}</h5>
                    </div>
                </div>
                <div id="header-main">
                    <div className="col-md-12 col-lg-9">
                        <div className="navbar-header">
                            <SubredditActions params={this.props.params} query={this.props.location.query} accessToken={this.props.accessToken} />
                            <button type="button" className="navbar-toggle" onClick={this.showSubs}>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                                <span className="icon-bar"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            );
    }
}

Header.propTypes = {
    params: PropTypes.object,
    query: PropTypes.object,
    accessToken: PropTypes.object,
    location: PropTypes.object,
    listingsTarget: PropTypes.string
};

const mapStateToProps = (state) => {
    return {
        listingsTarget: state.listingsTarget
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        // onSortTopChange: sortTop => dispatch(storeSortTop(sortTop)),
        // onSortChange: sort => dispatch(storeSort(sort))
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Header);
