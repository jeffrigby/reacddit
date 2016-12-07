import React, { PropTypes }  from 'react';
import Content from '../Content';

const Self = ({ content }) => {
    const html = <div dangerouslySetInnerHTML={{__html: content.html}}></div>;
    let inlineRendered;
    if (content.inline.length > 0) {
        inlineRendered = content.inline
            .map((item) => {
                const guid = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
                return <div className="inline-render" key={guid}><Content content={item}/></div>;
            }, this);
    }

    return (<div className="self">
        {html}
        {inlineRendered}
    </div>);
};

Self.propTypes = {
    content: PropTypes.object
};

export default Self;
