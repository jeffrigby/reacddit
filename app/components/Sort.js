import React, { PropTypes }  from 'react';
import {Link} from 'react-router';
import { connect } from 'react-redux';
import { listingsSort } from '../redux/actions/listings';

/**
 * Import all actions as an object.
 */

class Sort extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.target === 'friends') {
            return false;
        }
        const currentSort = this.props.sort ? this.props.sort : 'hot';
        return (
            <div style={{'display': 'inline-block'}}>
                <button type="button" className="btn btn-default btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="glyphicon glyphicon-time"></span> <span className="dropdownActive">{currentSort}</span> <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="sortDropdownMenu">
                    <li><Link to={'/r/' + this.props.target + '/hot'}>hot</Link></li>
                    <li><Link to={'/r/' + this.props.target + '/new'}>new</Link></li>
                    <li><Link to={'/r/' + this.props.target + '/top'}>top</Link></li>
                    <li><Link to={'/r/' + this.props.target + '/rising'}>rising</Link></li>
                    <li><Link to={'/r/' + this.props.target + '/controversial'}>controversial</Link></li>
                </ul>
            </div>
            );
    }
}

Sort.propTypes = {
    target: PropTypes.string,
    sort: PropTypes.string.isRequired,
    setSort: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => {
    return {
        sort: state.listingsSort,
        target: state.listingsTarget
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSort: (sort) => dispatch(listingsSort(sort)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Sort);
