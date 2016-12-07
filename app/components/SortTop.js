import React, { PropTypes }  from 'react';
import {browserHistory} from 'react-router';


/**
 * Import all actions as an object.
 */

class SortTop extends React.Component {
    constructor(props) {
        super(props);
    }

    onClick(e) {
        e.preventDefault();
        const sortTopKey = jQuery(e.target).data('key');
        const sort = this.props.sort ? this.props.sort : 'hot';
        browserHistory.push('/r/' + this.props.subreddit + '/' + sort + '/?t=' + sortTopKey);
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
        if (this.props.sort !== 'top' && this.props.sort !== 'controversial') {
            return null;
        }

        const sort = this.getSorts();
        const sortValue = sort[this.props.sortTop];

        return (
            <div className="dropdown">
                <button className="btn btn-default dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
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
    sort: PropTypes.string,
    sortTop: PropTypes.string,
    subreddit: PropTypes.string,
};

export default SortTop;
