import React from 'react';
import { renderToString } from 'react-dom/server';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { match, RouterContext } from 'react-router';
import reducers from './reducers';
import routes from './routes';

export default (req, res) => {
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
        if(error) {
            res.status(500).send(error.message);
        } else if(redirectLocation) {
            res.redirect(302, redirectLocation.pathname + redirectLocation.search);
        } else if(renderProps) {
            if(process.env.NODE_ENV == 'development') {
                res.status(200).send(`
					<!doctype html>
					<html>
						<header>
							    <meta charset="utf-8">
                  <meta http-equiv="x-ua-compatible" content="ie=edge">
                  <title>RedditJS</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
                  <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
						</header>
						<body>
							<div id='app'></div>
							<script src='bundle.js'></script>
							<script src="https://code.jquery.com/jquery-3.1.1.js"   integrity="sha256-16cdPddA6VdVInumRGo6IbivbERE8p7CQR3HzTBuELA="   crossorigin="anonymous"></script>
              <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
						</body>
					</html>
				`);
            } else if(process.env.NODE_ENV == 'production') {
                res.status(200).send(`
                <!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>Reddit React</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css">
        <link rel="stylesheet" href="/main.min.css">
    </head>
    <body class="view-login">
        <div id="root">${renderToString(
                    <Provider store={createStore(reducers)}>
                        <RouterContext {...renderProps} />
                    </Provider>)}</div>
        <script   src="https://code.jquery.com/jquery-3.1.1.js"   integrity="sha256-16cdPddA6VdVInumRGo6IbivbERE8p7CQR3HzTBuELA="   crossorigin="anonymous"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
          <script src="/main.min.js"></script>
    </body>
</html>
				`);
            }
        } else {
            res.status(404).send('Not found');
        }
    });
};
