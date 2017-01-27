import React, { PropTypes }  from 'react';
import IFrame16x9 from './contentTypes/IFrame16x9';
import Image from './contentTypes/Image';
import VideoComp from './contentTypes/VideoComp';
import IFrame4x4 from './contentTypes/IFrame4x4';
import Thumb from './contentTypes/Thumb';
import Self from './contentTypes/Self';
import ImgurAlbum from './contentTypes/ImgurAlbum';

/**
 * Import all actions as an object.
 */

class Content extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let content = '';
        if (this.props.content.type) {
            switch(this.props.content.type) {
                case 'image':
                    content = <Image content={this.props.content} preload={this.props.preload} />;
                    break;
                case 'video':
                    content = <VideoComp content={this.props.content} preload={this.props.preload} />;
                    break;
                case 'iframe_4x4':
                    content = <IFrame4x4 content={this.props.content} preload={this.props.preload} />;
                    break;
                case 'iframe16x9':
                    content = <IFrame16x9 content={this.props.content} preload={this.props.preload} />;
                    break;
                case 'imgur_album':
                    content = <ImgurAlbum content={this.props.content} preload={this.props.preload} />;
                    break;
                case 'thumb':
                    content = <Thumb content={this.props.content} preload={this.props.preload} />;
                    break;
                case 'self':
                    content = <Self content={this.props.content} preload={this.props.preload} />;
                    break;
                default:
                    break;
            }
        } else if (this.props.content !== '') {
            content = <div>No preview available.</div>;
            // content = (<div dangerouslySetInnerHTML={{__html: this.props.content}}></div>);
        } else {
            content = '';
        }

        return (<div className="content">{content}</div>);
    }
}

Content.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool
};

export default Content;
