import React, { PropTypes }  from 'react';
import {browserHistory} from 'react-router';
import { connect } from 'react-redux';
import { listingsSortTop } from '../redux/actions/listings';

/**
 * Import all actions as an object.
 */

class SortTop extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(e) {
        e.preventDefault();
        const sortTopKey = e.target.dataset.key;
        const sort = this.props.sort ? this.props.sort : 'hot';
        const target = this.props.target ? this.props.target : 'mine';
        browserHistory.push('/r/' + target + '/' + sort + '/?t=' + sortTopKey);
    }

    getSorts() {
        return {
            'hour': 'past hour',
            'day': 'past 24 hour',
            'month': 'past month',
            'year': 'past year',
            'all': 'all time'
        };
    }

    render() {
        if (this.props.sort !== 'top' && this.props.sort !== 'controversial' || this.props.target === 'friends') {
            return null;
        }

        const sort = this.getSorts();
        const sortValue = sort[this.props.sortTop];

        return (
            <div style={{'display': 'inline-block'}}>
                <button className="btn btn-default btn-xs dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span className="glyphicon glyphicon-time"></span> {sortValue} <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="dropdownMenu1">
                    <li><a href="#" onClick={this.onClick.bind(this)} data-key="hour">past hour</a></li>
                    <li><a href="#" onClick={this.onClick.bind(this)} data-key="day">past 24 hours</a></li>
                    <li><a href="#" onClick={this.onClick.bind(this)} data-key="month">past month</a></li>
                    <li><a href="#" onClick={this.onClick.bind(this)} data-key="year">past year</a></li>
                    <li><a href="#" onClick={this.onClick.bind(this)} data-key="all">all time</a></li>
                </ul>
            </div>
        );
    }
}

SortTop.propTypes = {
    target: PropTypes.string,
    sort: PropTypes.string.isRequired,
    sortTop: PropTypes.string.isRequired,
    setSortTop: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    return {
        sort: state.listingsSort,
        sortTop: state.listingsSortTop,
        target: state.listingsTarget
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSortTop: (sortTop) => dispatch(listingsSortTop(sortTop)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(SortTop);
