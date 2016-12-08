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
            <div className="row-offcanvas row-offcanvas-left">
                <div id="sidebar" className="sidebar-offcanvas">
                    <div className="col-md-12">
                        <div id="subreddits-nav">
                            <Navigation params={this.props.params} query={this.props.location.query} accessToken={accessToken} />
                        </div>
                    </div>
                </div>
                <div id="main">
                    <div className="col-md-12">
                        <p className="visible-xs">
                            <button type="button" className="btn btn-primary btn-xs" data-toggle="offcanvas"><i className="glyphicon glyphicon-chevron-left"></i></button>
                        </p>
                        <div className="list-group" id="entries">
                            {this.props.children}
                        </div>
                    </div>
                </div>
            </div>
        <div id="push"></div>
        </div>);
    }
}

App.propTypes = {
    children: PropTypes.object,
    params: PropTypes.object,
    location: PropTypes.object,
};

export default App;
