import React, { PropTypes } from 'react';
import NavigationItem from './NavigationItem';
import {Link, browserHistory} from 'react-router';
import { connect } from 'react-redux';
import { subredditsFetchData, subredditsFetchDefaultData, subredditsFetchLastUpdated, subredditsFilter} from '../redux/actions/subreddits';
require('es6-promise').polyfill();
require('isomorphic-fetch');
import cookie from 'react-cookie';

class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.randomSub = this.randomSub.bind(this);
    }

    componentWillMount() {
        this.intervals = [];
    }

    componentDidMount() {
        jQuery(document).keypress(this.handleNavHotkey.bind(this));
        jQuery(window).on('load resize', this.resizeNavigation);
        if (this.props.accessToken) {
            this.props.fetchSubreddits(true, false);
        } else {
            this.props.fetchDefaultSubreddits();
        }
    }

    componentDidUpdate() {
        this.resizeNavigation();
    }

    componentWillUnmount() {
        this.intervals.map(clearInterval);
    }

    setInterval() {
        this.intervals.push(setInterval.apply(null, arguments));
    }

    resizeNavigation() {
        let vph = jQuery(window).height();
        vph = vph - 150;
        jQuery('#subreddits nav').css('max-height', vph + 'px');
    }

    filterData(item) {
        const queryText = item.target.value;
        if (!queryText) {
            return this.props.setFilter('');
        }
        return this.props.setFilter(queryText);
    }

    handleNavHotkey(event) {
        switch (event.charCode) {
            case 76: // shift-l
                this.reloadSubreddits();
                break;
            case 82: // shift-R
                this.randomSubPush();
                break;
            default:
                break;
        }
    }

    clearSearch() {
        this.props.setFilter('');
    }

    reloadSubreddits() {
        if (this.props.accessToken) {
            this.props.fetchSubreddits(true);
        } else {
            this.props.fetchDefaultSubreddits();
        }
    }

    reloadSubredditsClick(e) {
        e.preventDefault();
        this.reloadSubreddits();
    }

    filterSubreddits(subreddits) {
        if (this.isEmpty(subreddits)) {
            return {};
        }

        const filterText = this.props.filter.toLowerCase();
        // No filter defined
        if (!filterText) {
            return subreddits;
        }

        const filteredSubreddits = {};
        for (const key in subreddits) {
            if (subreddits.hasOwnProperty(key)) {
                if (subreddits[key].display_name.toLowerCase().indexOf(filterText) !== -1) {
                    filteredSubreddits[key] = subreddits[key];
                }
            }
        }

        return filteredSubreddits;
    }

    generateNavItems(subreddits) {
        const lastUpdated = this.props.lastUpdated;
        const navigationItems = [];
        for (const key in subreddits) {
            if (subreddits.hasOwnProperty(key)) {
                const item = subreddits[key];
                const subLastUpdated = lastUpdated[item.name] ? lastUpdated[item.name] : 0;
                navigationItems.push(<NavigationItem item={item} key={item.name} lastUpdated={subLastUpdated} />);
            }
        }
        return navigationItems;
    }

    toggleOnlyNew(item) {
        return item;
    }

    randomSub(e) {
        e.preventDefault();
        this.randomSubPush();
    }

    randomSubPush() {
        const subreddits = this.props.subreddits;
        const keys = Object.keys(subreddits);
        const randomSubreddit = subreddits[keys[ keys.length * Math.random() << 0]];
        const url = randomSubreddit.url + (this.props.params.sort ? this.props.params.sort : 'hot');
        browserHistory.push(url);
    }

    isEmpty(obj) {
        for(const key in obj) {
            if(obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    render() {
        const subreddits = this.props.subreddits;


        if (this.props.isLoading || this.isEmpty(subreddits)) {
            return (
                <div id="subreddits">
                    <div className="alert alert-info" id="subreddits-loading" role="alert">
                        <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Getting subreddits.
                    </div>
                </div>
            );
        }

        if (this.props.hasErrored) {
            return (
                <div className="alert alert-danger" id="subreddits-load-error" role="alert" style={{display: 'none'}}>
                    <span className="glyphicon glyphicon glyphicon-alert"></span> Error loading subreddits.
                    <a href="" style={subredditsActive === 0 ? {display: 'none'} : null} onClick={this.reloadSubredditsClick.bind(this)}>Click here to try again.</a>
                </div>
            );
        }

        const filterText = this.props.filter;
        const filteredSubreddits = this.filterSubreddits(subreddits);
        const sort = this.props.params.sort ? this.props.params.sort : 'hot';
        const redditUser = cookie.load('redditUser');
        const accessToken = this.props.accessToken;

        let navItems;
        let subredditsActive = 0;

        if (!this.isEmpty(filteredSubreddits)) {
            navItems = this.generateNavItems(filteredSubreddits);
            subredditsActive = 1;
        }

        const notFound = this.isEmpty(navItems) ? 1 : 0;

        return (
            <div id="subreddits">
                <div id="subreddit-filter-group">
                    <div className="form-group-sm">
                        <input
                            type="search"
                            className="form-control"
                            onChange={ this.filterData.bind(this) }
                            placeholder="Filter Subreddits"
                            id="subreddit-filter"
                            value={filterText}
                        />

                        <span id="searchclear" className="glyphicon glyphicon-remove-circle" onClick={this.clearSearch.bind(this)}></span>
                    </div>
                    <div className="subreddit-options">
                        <div className="checkbox">
                            <label>
                                <input type="checkbox" id="subreddit-filter-only-new" onClick={this.toggleOnlyNew.bind(this)} /> Show only new
                            </label>
                        </div>
                    </div>
                </div>

                <nav className="navigation subreddits-nav hidden-print" id="side-nav">
                    <div className="alert alert-info" id="subreddits-end" role="alert" style={notFound !== 1 ? {display: 'none'} : null}>
                        <span className="glyphicon glyphicon-info-sign"></span> No subreddits found
                    </div>


                    {!filterText &&
                    ( <ul className="nav">
                            {!accessToken && (<li><div id="login"><a href="/api/reddit-login">Login</a> to view your subreddits.</div></li>)}
                            <li><div><Link to={'/r/mine/' + sort} title="Show all subreddits" activeClassName="activeSubreddit">Front</Link></div></li>
                            <li><div><Link to={'/r/popular/' + sort} title="Show popular subreddits" activeClassName="activeSubreddit">Popular</Link></div></li>
                            <li><div><a href="/r/myrandom" onClick={this.randomSub}>Random</a></div></li>
                            {accessToken && (<li><div><Link to={'/r/friends/' + sort} title="Show Friends Posts" activeClassName="activeSubreddit">Friends</Link></div></li>)}
                            {redditUser && (<li><div><Link to={'/user/' + redditUser + '/submitted/' + sort} title="Submitted" activeClassName="activeSubreddit">Submitted</Link></div></li>)}
                            {redditUser && (<li><div><Link to={'/user/' + redditUser + '/upvoted/' + sort} title="Upvoted" activeClassName="activeSubreddit">Upvoted</Link></div></li>)}
                            {redditUser && (<li><div><Link to={'/user/' + redditUser + '/downvoted/' + sort} title="Downvoted" activeClassName="activeSubreddit">Downvoted</Link></div></li>)}
                            {redditUser && (<li><div><Link to={'/user/' + redditUser + '/saved'} title="Saved" activeClassName="activeSubreddit">Saved</Link></div></li>)}
                    </ul>)
                    }

                    <div className="nav-divider"></div>

                    <ul className="nav">
                        {navItems}
                    </ul>
                </nav>
                <div>
                    <a href="" style={subredditsActive === 0 ? {display: 'none'} : null} onClick={this.reloadSubredditsClick.bind(this)}>Reload Subreddits</a>
                </div>
            </div>
        );
    }
}

Navigation.propTypes = {
    params: PropTypes.object,
    query: PropTypes.object,
    accessToken: PropTypes.object,
    fetchSubreddits: PropTypes.func.isRequired,
    fetchDefaultSubreddits: PropTypes.func.isRequired,
    fetchLastUpdated: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
    subreddits: PropTypes.object.isRequired,
    lastUpdated: PropTypes.object.isRequired,
    hasErrored: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    filter: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
    return {
        subreddits: state.subreddits,
        lastUpdated: state.lastUpdated,
        hasErrored: state.subredditsHasErrored,
        isLoading: state.subredditsIsLoading,
        filter: state.subredditsFilter
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        fetchSubreddits: (auth, reload) => dispatch(subredditsFetchData(auth, reload)),
        fetchDefaultSubreddits: () => dispatch(subredditsFetchDefaultData()),
        setFilter: (filterText) => dispatch(subredditsFilter(filterText)),
        fetchLastUpdated: (subreddits, lastUpdated) => dispatch(subredditsFetchLastUpdated(subreddits, lastUpdated))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Navigation);
