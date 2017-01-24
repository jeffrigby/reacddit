import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Entry from '../components/Entry';
// import cookie from 'react-cookie';

const onePxSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

// import { Link } from 'react-router';
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
        this.getEntries();
        this.setInterval(this.monitorEntries.bind(this), 500);
    }

    componentWillReceiveProps(newProps) {
        this.setState(this.getState(newProps), () => {this.getEntries(newProps, true);});
    }

    componentWillUnmount() {
        this.intervals.map(clearInterval);
    }

    setInterval() {
        this.intervals.push(setInterval.apply(null, arguments));
    }

    getState(props) {
        const newProps = props ? props : this.props;

        // Set initial application state using props
        return {
            entries: {},
            subreddit: newProps.subreddit,
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
            jQuery.each(entries, (idx, entry) => {
                const visible = this.isInViewport(entry, -50);
                if (visible) {
                    if (focused === 0) {
                        this.setFocus(entry);
                        focused = 1;
                    }
                }
            });

            const content = jQuery('.entry .content video, .entry .content iframe, .entry .content img');
            jQuery.each(content, (idx, contentItem) => {
                const visible = this.isInViewport(contentItem, 100);
                if (visible) {
                    this.lazyLoad(contentItem);
                } else {
                    this.lazyUnload(contentItem);
                }
            });

            this.checkLoadMore();
        }
    }

    lazyLoad(contentElm) {
        const tag = jQuery(contentElm).prop('tagName');
        if (jQuery(contentElm).hasClass('unloaded')) {
            jQuery(contentElm).removeClass('unloaded');
            switch(tag) {
                case 'VIDEO':
                    this.videoLoad(contentElm);
                    break;
                case 'IFRAME':
                    this.iframeLoad(contentElm);
                    break;
                case 'IMG':
                    this.imgLoad(contentElm);
                    break;
                default:
                    break;
            }
            jQuery(contentElm).addClass('loaded');
        }
    }

    lazyUnload(contentElm) {
        const tag = jQuery(contentElm).prop('tagName');
        if (jQuery(contentElm).hasClass('loaded')) {
            jQuery(contentElm).removeClass('loaded');
            switch(tag) {
                case 'VIDEO':
                    this.videoUnload(contentElm);
                    break;
                case 'IFRAME':
                    this.iframeUnload(contentElm);
                    break;
                case 'IMG':
                    this.imgUnload(contentElm);
                    break;
                default:
                    break;
            }
            jQuery(contentElm).addClass('unloaded');
        }
    }

    videoLoad(elm) {
        const video = jQuery(elm);
        // Replace poster
        video.attr('poster', jQuery(elm).attr('data-poster'));
        video.children('source').each((index, el) => {
            jQuery(el).attr('src', jQuery(el).attr('data-src'));
        }
        );
        elm.load();
        elm.play();
        // map the currentSRC to data-src
        if (elm.currentSrc !== '') {
            video.attr('data-src', elm.currentSrc);
        }
    }

    videoUnload(elm) {
        elm.pause();
        const video = jQuery(elm);
        video.attr('poster', onePxSrc);
        video.children('source').each((index, el) => {
            jQuery(el).removeAttr('src');
        }
        );
        elm.load();
    }

    iframeLoad(elm) {
        jQuery(elm).attr('src', jQuery(elm).attr('data-orig'));
    }

    iframeUnload(elm) {
        if (!jQuery(elm).is('[data-orig]')) {
            jQuery(elm).attr('data-orig', jQuery(elm).attr('src'));
        }
        jQuery(elm)[0].src = '/iframe.html';
    }

    imgLoad(elm) {
        jQuery(elm).attr('src', jQuery(elm).attr('data-orig'));
    }

    imgUnload(elm) {
        if (jQuery(elm).is('[data-thumb]')) {
            jQuery(elm).attr('src', jQuery(elm).attr('data-thumb'));
        } else {
            jQuery(elm).attr('src', onePxSrc);
        }
    }

    setFocus(entry) {
        if (jQuery(entry).hasClass('focused')) {
            return;
        }

        jQuery('div.entry.focused').removeClass('focused');
        jQuery(entry).addClass('focused');
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
            focus =  jQuery('div.entry:first').addClass('focused');
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
        let url = '/json/' + props.entryType + '/' + props.subreddit + '/' + props.sort;
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
            const entries = reload ? result.entries : jQuery.extend({}, this.state.entries, result.entries);
            this.setState({
                entries: entries,
                after: result.after,
                before: result.before,
                loading: 0
            });
            window.setTimeout(() => {this.scrollResize = true;}, 250);
            window.setTimeout(() => {this.scrollResize = true;}, 500);
            window.setTimeout(() => {this.scrollResize = true;}, 750);
        });
    }

    render() {
        // const accessToken = cookie.load('accessToken');
        // if (!accessToken) {
        //     return (
        //         <div>
        //             <h4>Login</h4>
        //             <a href="/api/reddit-login">Login</a> to view entries.
        //         </div>
        //     );
        // }

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
                    />
                );
            });
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
    subreddit: PropTypes.string,
    sortTop: PropTypes.string,
    after: PropTypes.string,
    before: PropTypes.string,
    limit: PropTypes.string,
    debug: PropTypes.bool
};

const mapStateToProps = (state, ownProps) => {
    const currentUrl = ownProps.location.pathname;
    const entryType = currentUrl.substring(2, 1);
    const defaultSort = (entryType === 'u') ? 'new' : 'hot';

    return {
        entryType: entryType ? entryType : 'r',
        subreddit: ownProps.params.subreddit ? ownProps.params.subreddit : 'mine',
        sort: ownProps.params.sort ? ownProps.params.sort : defaultSort,
        sortTop: ownProps.location.query.t ? ownProps.location.query.t : '',
        after: ownProps.location.query.after ? ownProps.location.query.after : '',
        before: ownProps.location.query.before ? ownProps.location.query.before : '',
        limit: ownProps.location.query.limit ? ownProps.location.query.limit : '',
        debug: ownProps.location.query.debug ? true : false
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
)(Entries);
