import React, { PropTypes }  from 'react';
import Content from '../Content';

const Self = ({ content, preload, name }) => {
    let rawhtml = content.html;
    rawhtml = rawhtml.replace(/<a\s+href=/gi, '<a target="_blank" href=');
    const html = <div dangerouslySetInnerHTML={{__html: rawhtml}}></div>;
    let inlineRendered;
    if (content.inline.length > 0) {
        let i = 0;
        inlineRendered = content.inline
            .map((item) => {
                i++;
                const guid = 'inline' + name + i;
                return <div className="inline-render" key={guid}><Content content={item} preload={preload} /></div>;
            }, this);
    }

    return (<div className="self">
        {html}
        {inlineRendered}
    </div>);
};

Self.propTypes = {
    content: PropTypes.object,
    preload: PropTypes.bool,
    name: PropTypes.string
};

export default Self;
