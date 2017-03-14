'use strict';

/**
 * Module dependencies.
 */

const Koa = require('koa');
const middlewares = require('koa-middlewares');
const path = require("path");
const serve = require("koa-static-cache");
const convert = require('koa-convert');
const router = require('koa-router')();
import historyApiFallback from 'connect-history-api-fallback';
const app = new Koa();
// import reactrouter from 'koa-react-router';

const config = {
    version: "1.0",
    debug: process.env.NODE_ENV !== 'production',
    port: process.env.PORT || 3000,
    root: path.normalize(path.join(__dirname, "/"))
};

const STATIC_FILES_MAP = {};
const SERVE_OPTIONS = { maxAge: 365 * 24 * 60 * 60 };

/** Apply middlwares
 *
 */
// This rewrites all routes requests to the root /index.html file
// (ignoring file requests). If you want to implement isomorphic
// rendering, you'll want to remove this middleware.
// app.use(historyApiFallback({
//     verbose: false
// }));

/**
 * ignore favicon
 */
app.use(middlewares.favicon());

/**
 * response time header
 */
app.use(middlewares.rt());

/**
 * Logger
 */
app.use(middlewares.logger());


// app.use(require('koa-static')(root, opts));

app.use(serve('./dist', SERVE_OPTIONS, STATIC_FILES_MAP));
// this last middleware catches any request that isn't handled by
// koa-static or koa-router, ie your index.html in your example
app.use(function* index() {
    yield send(this, './dist/index.html');
});

//
// router.get('/info', function *(next) {
//     this.body = "SOmething else";
// });
//
// app
//     .use(router.routes())
//     .use(router.allowedMethods());
//
// app.use('*', serve(path.join(config.root, "build", "public"), SERVE_OPTIONS, STATIC_FILES_MAP));

app.listen(config.port);
console.log('$ open http://127.0.0.1:' + config.port);