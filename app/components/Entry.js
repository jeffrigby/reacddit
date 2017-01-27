import React, { PropTypes } from 'react';
import {Link} from 'react-router';
const TimeAgo = require('react-timeago').default;
import Content from './Content';

class Entry extends React.Component {
    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.sort !== nextProps.sort) {
            return true;
        }
        if (this.props.debug !== nextProps.debug) {
            return true;
        }
        if (this.props.sortTop !== nextProps.sortTop) {
            return true;
        }
        if (this.props.entry !== nextProps.entry) {
            return true;
        }
        if (this.props.loaded !== nextProps.loaded) {
            return true;
        }
        return false;
    }

    render() {
        const entry = this.props.entry;
        const timeago = entry.created_raw * 1000;
        const subUrl = '/r/' + entry.subreddit;
        const debugUrl = subUrl + '/' + this.props.sort;
        const contentObj = typeof entry.content === 'object' ? entry.content : {};
        const preload = this.props.incrm <= 2 || this.props.loaded ? true : false;
        const content = <Content content={contentObj} preload={preload} />;
        const debug = process.env.NODE_ENV === 'development' && !this.props.debug ?
            <span className="debug meta-sub"><Link to={{pathname: debugUrl, query: {t: this.props.sortTop, after: entry.lastID, limit: 1, debug: 1}}}>debug</Link></span> :
            '';

        const debugString = process.env.NODE_ENV === 'development' && this.props.debug ? <div className="debug"><pre>{JSON.stringify(entry, null, '\t')}</pre></div> : '';
        return (
            <div className="entry list-group-item" key={entry.url_id} id={entry.name}>
                <div className="entry-interior">
                    <h3 className="title list-group-item-heading"><a href={entry.url} target="_blank" className="list-group-item-heading">{entry.title}</a></h3>
                    <div className="vote">
                        <button type="button" className="btn btn-link btn-sm"><span className="glyphicon glyphicon-thumbs-up" aria-hidden="true"></span> {entry.ups}</button>
                        <button type="button" className="btn btn-link btn-sm"><span className="glyphicon glyphicon-thumbs-down" aria-hidden="true"></span></button>
                    </div>
                    {content}
                    <small className="meta clearfix">
                        <span className="date-author meta-sub">
                            Submitted <TimeAgo date={timeago}/> by <span className="author">
                            <Link to={'/user/' + entry.author + '/submitted'}>{entry.author}</Link></span> to <span className="subreddit meta-sub"><Link to={subUrl}>/r/{entry.subreddit}</Link></span>
                        </span>
                        <span className="source meta-sub">{entry.domain}</span>
                        <span className="comments meta-sub"><a href={'https://www.reddit.com/' + entry.permalink} target="_blank">comments <span className="badge">{entry.num_comments}</span></a></span>
                        {debug}
                    </small>
                    {debugString}
                </div>
            </div>
        );
    }
}

Entry.propTypes = {
    entry: PropTypes.object,
    debug: PropTypes.bool,
    sort: PropTypes.string,
    sortTop: PropTypes.string,
    incrm: PropTypes.number,
    loaded: PropTypes.bool
};

module.exports = Entry;
