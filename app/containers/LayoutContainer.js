import React, { PropTypes } from 'react';

const LayoutContainer = (props) => (
    <div>
        {props.children}
    </div>
);

LayoutContainer.propTypes = {
    children: PropTypes.object
};

export default LayoutContainer;
