import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Entry from '../components/Entry';
import { listingsSort, listingsSortTop, listingsTarget, listingsListType } from '../redux/actions/listings';

class Entries extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getState();
        this.intervals = [];
        this.scrollResize = true;
        this.scrollResizeStop = false;
    }

    componentDidMount() {
        jQuery(document).keypress(this.handleHotkey.bind(this));
        jQuery(window).on('load resize scroll', () => {this.scrollResize = true;});
        this.setRedux();
        this.getEntries();
        this.setInterval(this.monitorEntries.bind(this), 500);
    }

    componentWillReceiveProps(newProps) {
        if (
            this.props.target !== newProps.target ||
            this.props.sortTop !== newProps.sortTop ||
            this.props.sort !== newProps.sort ||
            this.props.userType !== newProps.userType
        ) {
            this.setState(this.getState(newProps), () => {this.getEntries(newProps, true);});
        }
    }

    componentWillUpdate() {
        this.setRedux();
    }

    componentWillUnmount() {
        this.intervals.map(clearInterval);
    }

    setRedux() {
        if (this.props.listingsSort !== this.props.sort) {
            this.props.setSort(this.props.sort);
        }
        if (this.props.listingsSortTop !== this.props.sortTop) {
            this.props.setSortTop(this.props.sortTop);
        }

        if (this.props.listingsTarget !== this.props.target) {
            this.props.setTarget(this.props.target);
        }

        if (this.props.listingsListType !== this.props.entryType) {
            this.props.setListType(this.props.entryType);
        }
    }

    setInterval() {
        this.intervals.push(setInterval.apply(null, arguments));
    }

    getState(props) {
        const newProps = props ? props : this.props;

        // Set initial application state using props
        return {
            entries: {},
            subreddit: newProps.target,
            sort: newProps.sort,
            sortTop: newProps.sortTop,
            after: newProps.after,
            before: newProps.before,
            limit: newProps.limit,
            debug: newProps.debug,
            loading: 1
        };
    }

    isInViewport(elm, y) {
        const viewport = {};
        viewport.top = jQuery(window).scrollTop();
        viewport.height = jQuery(window).height();
        viewport.bottom = viewport.top + viewport.height;

        const element = {};
        element.top = jQuery(elm).offset().top;
        element.height = jQuery(elm).height();
        element.bottom = element.top + element.height;

        if ((viewport.top - element.bottom <= y) && (element.top - viewport.bottom <= y)) {
            return true;
        }

        return false;
    }

    monitorEntries() {
        if (this.scrollResize && !this.scrollResizeStop) {
            this.scrollResize = false;

            // Set the focus.
            const entries = jQuery('.entry');
            let focused = 0;
            const stateEntries = this.state.entries;
            jQuery.each(entries, (idx, entry) => {
                const inFocus = this.isInViewport(entry, -50);
                const visible = this.isInViewport(entry, 500);
                if (inFocus && focused === 0) {
                    stateEntries[entry.id].focused = true;
                    focused = 1;
                } else {
                    stateEntries[entry.id].focused = false;
                }

                stateEntries[entry.id].loaded = visible ? true : false;
            });

            this.setState({
                'entries': stateEntries
            });

            this.checkLoadMore();
        }
    }

    checkLoadMore() {
        if(jQuery(window).scrollTop() + jQuery(window).height() > jQuery(document).height() - 2500 && this.state.loading !== 1 && this.state.after && this.props.debug !== true) {
            this.getEntries(this.props, false);
        }
    }

    handleHotkey(event) {
        switch(event.charCode) {
            case 106:
                this.nextEntry();
                break;
            case 107:
                this.prevEntry();
                break;
            case 71:
                this.scrollToBottom();
                break;
            default:
                break;
        }
    }

    nextEntry() {
        let focus = jQuery('div.entry.focused');
        if (focus.length === 0) {
            focus =  jQuery('div.entry:first');
        }
        const goto = focus.next('div.entry');
        if (goto.length > 0) {
            jQuery('html, body').scrollTop(goto.offset().top - 50);
        } else {
            this.scrollToBottom();
        }
    }

    prevEntry() {
        const focus = jQuery('div.entry.focused');
        const goto = focus.prev('div.entry');
        if (goto.length > 0) {
            jQuery('html, body').scrollTop(goto.offset().top - 50);
        }
    }

    scrollToBottom() {
        window.scrollTo(0, document.body.scrollHeight);
    }

    getEntriesUrl(props, reload) {
        let url;
        if (props.entryType === 'r') {
            url = '/json/' + props.entryType + '/' + props.target + '/' + props.sort;
        } else if (props.entryType === 'u') {
            url = '/json/user/' + props.target + '/' + props.userType + '/' + props.sort;
        }

        const query = [];

        if (props.debug) {
            query.push('limit=1');
            query.push('after=' + props.after);
        } else {
            if (this.state.after !== null && reload === false) {
                query.push('after=' + this.state.after);
            }
            if (this.state.before !== null && reload === false) {
                query.push('before=' + this.state.before);
            }
            if (props.limit) {
                query.push('limit=' + props.limit);
            }
        }

        if (props.sort === 'top' || props.sort === 'controversial') {
            query.push('sort=' + props.sort);
            query.push('t=' + (props.sortTop ? props.sortTop : 'day'));
        }

        if (query.length > 0) {
            url += '?' + query.join('&');
        }
        return url;
    }

    getEntries(props, reload) {
        const newProps = props || this.props;

        if (reload || newProps.debug) {
            this.setState({
                loading: 1,
                entries: {}
            });
        } else {
            this.setState({
                loading: 1
            });
        }

        const url = this.getEntriesUrl(newProps, reload);

        jQuery.getJSON(url, (result) => {
            // this part needs work.
            const entriesObj = result.entries;
            // const entriesObjPre = {};
            // const entriesObjPost = {};
            let i = 0;
            for (const prop in entriesObj) {
                if (entriesObj.hasOwnProperty(prop)) {
                    // SHould I preload this?
                    if (i <= 2) {
                        entriesObj[prop].loaded = true;
                    }

                    const domainStr = entriesObj[prop].domain.replace('.', '');
                    if (typeof this['_render' + domainStr] === 'function') {
                        const renderedContent = this['_render' + domainStr](entriesObj[prop]);
                        entriesObj[prop].content = renderedContent;
                    }

                    // if (i <= 3) {
                    //     entriesObjPre[prop] = entriesObj[prop];
                    // } else {
                    //     entriesObjPost[prop] = entriesObj[prop];
                    // }
                    i++;
                }
            }

            this.setState({
                entries: reload ? entriesObj : jQuery.extend({}, this.state.entries, entriesObj),
                after: result.after,
                before: result.before,
                loading: 0
            });

            // console.log(entriesObjPre);
            // console.log(entriesObjPost);

            // if (reload) {
            //     // Render the first 4.
            //     this.setState({
            //         entries: entriesObjPre,
            //         after: result.after,
            //         before: result.before,
            //         loading: 1
            //     });
            //
            //     // Attach the rest of them.
            //     this.setState({
            //         entries: jQuery.extend({}, this.state.entries, entriesObjPost),
            //         after: result.after,
            //         before: result.before,
            //         loading: 0
            //     });
            // } else {
            //     this.setState({
            //         entries: reload ? entriesObj : jQuery.extend({}, this.state.entries, entriesObj),
            //         after: result.after,
            //         before: result.before,
            //         loading: 0
            //     });
            // }
        });
    }

    _renderwankflixcom(entry) {
        const pattern = /(\d+).html$/i;
        const url = entry.url.match(pattern);
        const id = url[1];
        return {
            'type': 'iframe16x9',
            'src': 'http://wankflix.com/embed/' + id
        };
    }

    render() {
        // console.log(this.state);
        let loading = '';
        if (this.state.loading === 1) {
            loading = <div className="alert alert-info" id="content-loading" role="alert"><span className="glyphicon glyphicon-refresh glyphicon-refresh-animate"></span> Getting entries from Reddit.</div>;
        }

        let entries = '';

        const entriesObject = this.state.entries;
        const entriesKeys = Object.keys(entriesObject);
        let lastKey;
        if (entriesKeys.length > 0) {
            entries = Object.keys(this.state.entries).map((key) => {
                entriesObject[key].lastID = lastKey ? lastKey : null;
                lastKey = key;
                return (
                    <Entry
                        entry={entriesObject[key]}
                        key={entriesObject[key].id}
                        debug={this.state.debug}
                        sort={this.state.sort}
                        sortTop={this.state.sortTop}
                        loaded={entriesObject[key].loaded}
                        focused={entriesObject[key].focused}
                    />
                );
            });
        } else {
            if (this.state.loading !== 1) {
                entries = (<div className="alert alert-warning" id="content-empty" role="alert">Can't find anything here.</div>);
            }
        }

        return(
            <div>
                {entries}
                {loading}
            </div>
        );
    }
}

Entries.propTypes = {
    params: PropTypes.object,
    location: PropTypes.object,
    entryType: PropTypes.string,
    sort: PropTypes.string,
    target: PropTypes.string,
    userType: PropTypes.string,
    sortTop: PropTypes.string,
    after: PropTypes.string,
    before: PropTypes.string,
    limit: PropTypes.string,
    debug: PropTypes.bool,
    setSort: PropTypes.func.isRequired,
    setSortTop: PropTypes.func.isRequired,
    setTarget: PropTypes.func.isRequired,
    setListType: PropTypes.func.isRequired,
    listingsSort: PropTypes.string,
    listingsSortTop: PropTypes.string,
    listingsTarget: PropTypes.string,
    listingsListType: PropTypes.string
};

const mapStateToProps = (state, ownProps) => {
    const currentUrl = ownProps.location.pathname;
    const entryType = currentUrl.substring(2, 1);
    const defaultSort = (entryType === 'u') ? 'new' : 'hot';

    return {
        entryType: entryType ? entryType : 'r',
        target: ownProps.params.target ? ownProps.params.target : 'mine',
        userType: ownProps.params.userType ? ownProps.params.userType : 'submitted',
        sort: ownProps.params.sort ? ownProps.params.sort : defaultSort,
        sortTop: ownProps.location.query.t ? ownProps.location.query.t : 'day',
        after: ownProps.location.query.after ? ownProps.location.query.after : '',
        before: ownProps.location.query.before ? ownProps.location.query.before : '',
        limit: ownProps.location.query.limit ? ownProps.location.query.limit : '',
        debug: ownProps.location.query.debug ? true : false,
        listingsSort: state.listingsSort,
        listingsSortTop: state.listingsSortTop,
        listingsTarget: state.listingsTarget,
        listingsListType: state.listingsListType,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        setSort: (sort) => dispatch(listingsSort(sort)),
        setSortTop: (sortTop) => dispatch(listingsSortTop(sortTop)),
        setTarget: (target) => dispatch(listingsTarget(target)),
        setListType: (listType) => dispatch(listingsListType(listType)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Entries);
