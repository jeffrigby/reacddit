import React, { PropTypes } from 'react';
import NavigationItem from './NavigationItem';
import {Link, browserHistory} from 'react-router';


class Navigation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            subreddits: [],
            loading: 1,
            filterText: ''
        };

        this.randomSub = this.randomSub.bind(this);
    }

    componentWillMount() {
        this.intervals = [];
    }

    componentDidMount() {
        jQuery(document).keypress(this.handleNavHotkey.bind(this));
        jQuery(window).on('load resize', this.resizeNavigation);
        this.getSubreddits();
        this.setInterval(this.lastUpdated.bind(this), 300000);
    }

    componentWillUnmount() {
        this.intervals.map(clearInterval);
    }

    setInterval() {
        this.intervals.push(setInterval.apply(null, arguments));
    }

    resizeNavigation() {
        let vph = jQuery(window).height();
        vph = vph - 200;
        jQuery('#subreddits nav').css('max-height', vph + 'px');
    }

    getSubreddits(reset) {
        let url = '/json/subreddits/lean';
        if  (reset === true) {
            url += '/true';
        }
        jQuery.getJSON(url, (data) => {
            this.setState({
                subreddits: data.subreddits,
                loading: 0
            });
            this.lastUpdated();
            this.resizeNavigation();
        });
    }

    filterData(item) {
        const queryText = item.target.value.toLowerCase();
        if (!queryText) {
            return this.setState({
                filterText: ''
            });
        }

        return this.setState({
            filterText: queryText
        });
    }

    handleNavHotkey(event) {
        switch (event.charCode) {
            case 76:
                this.reloadSubreddits();
                break;
            default:
                break;
        }
    }

    clearSearch() {
        return this.setState({
            filterText: ''
        });
    }

    lastUpdatedRequest(url) {
        return jQuery.getJSON(url).then((res) => res);
    }

    filterAjax(promises) {
        const results = [];
        let remaining = promises.length;
        const d = jQuery.Deferred();

        for (let i = 0; i < promises.length; i++) {
            promises[i].then((res) => {
                results.push(res); // on success, add to results
            }).always(() => {
                remaining--; // always mark as finished
                if(!remaining) d.resolve(results);
            });
        }
        return d.promise(); // return a promise on the remaining values
    }

    lastUpdateReplace() {
        const updatedDates = {};
        const items = this.state.subreddits;

        const responses = arguments;
        jQuery.each(responses[0], (idx, value) => {
            if (value.data.children.length > 0) {
                const created = value.data.children[0].data.created_utc;
                const subid = value.data.children[0].data.subreddit_id;
                updatedDates[subid] = created;
            } else {
                // Broken for some reason.
            }
        });

        jQuery.each(items, (idx, val) => {
            if (typeof updatedDates[val.id] !== 'undefined') {
                items[idx].lastUpdate = updatedDates[val.id];
            }
        });
        return this.replaceSubreddits(items);
    }

    replaceSubreddits(subreddits) {
        this.setState({
            subreddits: subreddits
        });
    }

    lastUpdated() {
        if (jQuery('#subreddits ul.nav li').length === 0) {
            window.setTimeout(this.lastUpdated.bind(this), 1000);
            return;
        }

        const items = this.state.subreddits;
        let deferreds = [];
        let i = 0;

        jQuery.each(items, (idx, value) => {
            if (value.url !== '/r/mine' && value.quarantine === false) {
                const url = 'https://www.reddit.com' + value.url + 'new.json?limit=1&sort=new';
                const promise = this.lastUpdatedRequest(url);

                deferreds.push(promise);
                i++;
                if (i >= 50) {
                    this.filterAjax(deferreds).then(this.lastUpdateReplace.bind(this));
                    i = 0;
                    deferreds = [];
                }
            }
        });

        if (deferreds.length > 0) {
            this.filterAjax(deferreds).then(this.lastUpdateReplace.bind(this));
        }
    }

    reloadSubreddits() {
        this.setState({
            subreddits: [],
            loading: 1
        });
        this.getSubreddits(true);
    }

    reloadSubredditsClick(e) {
        e.preventDefault();
        this.reloadSubreddits();
    }

    checkFilter(item) {
        const filterText = this.state.filterText;
        // No filter defined
        if (!filterText) {
            return true;
        }

        if (item.display_name.toLowerCase().indexOf(filterText) !== -1) {
            return true;
        }

        return false;
    }

    randomSub(e) {
        e.preventDefault();
        const subreddits = this.state.subreddits;
        const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
        const url = randomSubreddit.url + (this.props.params.sort ? this.props.params.sort : 'hot');
        browserHistory.push(url);
    }

    render() {
        if (!this.props.accessToken) {
            return (
                <div id="subreddits">
                    <h4>Subreddits</h4>
                    <a href="/api/reddit-login">Login</a> to view subreddits.
                </div>
            );
        }


        if (this.state.loading === 1) {
            return (
                <div id="subreddits">
                    <div className="alert alert-info" id="subreddits-loading" role="alert">
                        <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Getting subreddits.
                    </div>
                </div>
            );
        }

        const subreddits = this.state.subreddits;
        const filterText = this.state.filterText;
        const filteredSubreddits = subreddits.filter(this.checkFilter.bind(this));
        const sort = this.props.params.sort ? this.props.params.sort : 'hot';

        let navItems;
        let subredditsActive = 0;

        if (subreddits.length > 0) {
            navItems = filteredSubreddits
                .map((item) => {
                    return (
                        <NavigationItem item={item} key={item.id} sort={this.props.params.sort} />
                    );
                }, this);

            subredditsActive = 1;
        }

        // Use short syntax
        let notFound = 0;
        if (navItems.length === 0) {
            notFound = 1;
        }

        return (
            <div id="subreddits">
                <div className="alert alert-info" id="subreddits-loading" role="alert" style={subredditsActive > 0 ? {display: 'none'} : null}>
                    <span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Getting subreddits.
                </div>
                <div className="alert alert-danger" id="subreddits-load-error" role="alert" style={{display: 'none'}}>
                    <span className="glyphicon glyphicon glyphicon-alert"></span> Error loading subreddits.
                </div>

                <div style={subredditsActive === 0 ? {display: 'none'} : null} id="subreddit-filter-group">
                    <div className="form-group-sm ">
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
                </div>

                <nav className="navigation subreddits-nav hidden-print" id="side-nav">
                    <div className="alert alert-info" id="subreddits-end" role="alert" style={notFound !== 1 ? {display: 'none'} : null}>
                        <span className="glyphicon glyphicon-info-sign"></span> No subreddits found
                    </div>


                    {!filterText &&
                    ( <ul className="nav">
                            <li><div><Link to={'/r/mine/' + sort} title="Show all subreddits" activeClassName="activeSubreddit">Front</Link></div></li>
                            <li><div><Link to={'/r/friends/' + sort} title="Show Friends Posts" activeClassName="activeSubreddit">Friends</Link></div></li>
                            <li><div><a href="/r/myrandom" onClick={this.randomSub}>Random</a></div></li>
                    </ul>)
                    }
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
    accessToken: PropTypes.object
};

module.exports = Navigation;
