import React, { PropTypes } from 'react';
import Navigation from './Navigation';
import Header from '../containers/Header';
import cookie from 'react-cookie';

class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const accessToken = cookie.load('accessToken');

        return(<div>
            <Header params={this.props.params} query={this.props.location.query} accessToken={accessToken} />
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3 col-lg-2 hidden-print hidden-xs hidden-sm" role="complementary"
                         id="right-sidebar">
                        <div id="subreddits-nav">
                            <Navigation params={this.props.params} query={this.props.location.query} accessToken={accessToken} />
                        </div>
                    </div>
                    <div className="col-xs-12 col-md-9 col-lg-10">
                        <div className="list-group" id="entries">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    }
}

App.propTypes = {
    children: PropTypes.object,
    params: PropTypes.object,
    location: PropTypes.object,
};

export default App;
