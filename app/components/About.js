import React, { PropTypes }  from 'react';
/**
 * Import all actions as an object.
 */

class About extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<div>
            Just a dummy page to showcase react-router!
            <p>
            {this.props.params.subreddit}
            </p>
        </div>);
    }
}

About.propTypes = {
    params: PropTypes.object
};


export default About;
