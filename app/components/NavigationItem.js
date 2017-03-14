import React, { PropTypes } from 'react';
import Common from '../common.js';
import {Link} from 'react-router';
import { connect } from 'react-redux';
import { subredditsCurrent} from '../redux/actions/subreddits';


class NavigationItem extends React.Component {
    constructor(props) {
        super(props);
    }

    lastUpdatedDiff(lastUpdated) {
        const now = Math.floor((new Date()).getTime() / 1000);
        const seconds = now - lastUpdated;
        return seconds;
    }

    render() {
        const sort = this.props.sort ? this.props.sort : '';
        const href = Common.stripTrailingSlash(this.props.item.url) + '/' + sort;
        let classNameStr;
        let subLabel;

        if (this.props.lastUpdated > 0) {
            const seconds = this.lastUpdatedDiff(this.props.lastUpdated);
            const deadSecs = ((365 / 2) * 24 * 3600); // 6 months
            const staleSecs = ((365 / 12) * 1 * 24 * 3600); // 3 months
            const todaySecs = (24 * 3600); // 1 day
            const newSecs = 3600 / 2; // 30 minutes

            if (seconds >= deadSecs) {
                classNameStr = 'sub-dead';
            } else if (seconds >= staleSecs) {
                classNameStr = 'sub-stale';
            } else if (seconds <= newSecs) {
                classNameStr = 'sub-new';
                subLabel = <span className="label label-success">New</span>;
            } else if (seconds <= todaySecs) {
                classNameStr = 'sub-today';
            }
        }

        return (
            <li>
                <div id={this.props.item.id} className={classNameStr}>
                    <Link to={href} title={this.props.item.public_description} activeClassName="activeSubreddit">{this.props.item.display_name}</Link> {subLabel}
                </div>
            </li>
        );
    }
}

NavigationItem.propTypes = {
    item: PropTypes.object,
    sort: PropTypes.string.isRequired,
    lastUpdated: PropTypes.number,
    setCurrentSubreddit: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
    return {
        sort: state.listingsSort
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setCurrentSubreddit: (subreddit) => dispatch(subredditsCurrent(subreddit)),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationItem);
