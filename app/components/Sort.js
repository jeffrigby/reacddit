import React, { PropTypes }  from 'react';
import {Link} from 'react-router';

/**
 * Import all actions as an object.
 */

class Sort extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const currentSort = this.props.sort ? this.props.sort : 'hot';

        return (
            <div className="dropdown sortDropDown">
                <button className="btn btn-default dropdown-toggle" type="button" id="sortDropdownMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                    <span className="glyphicon glyphicon-time"></span> <span className="dropdownActive">{currentSort}</span> <span className="caret"></span>
                </button>
                <ul className="dropdown-menu" aria-labelledby="sortDropdownMenu">
                    <li><Link to={'/r/' + this.props.subreddit + '/hot'}>hot</Link></li>
                    <li><Link to={'/r/' + this.props.subreddit + '/new'}>new</Link></li>
                    <li><Link to={'/r/' + this.props.subreddit + '/top'}>top</Link></li>
                    <li><Link to={'/r/' + this.props.subreddit + '/rising'}>rising</Link></li>
                    <li><Link to={'/r/' + this.props.subreddit + '/controversial'}>controversial</Link></li>
                </ul>
            </div>
            );
    }
}

Sort.propTypes = {
    subreddit: PropTypes.string,
    sort: PropTypes.string
};

export default Sort;
