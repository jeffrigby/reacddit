var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var fs = require("fs");
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
    publicPath: config.output.publicPath,
    hot: true,
    historyApiFallback: true,
    // It suppress error shown in console, so it has to be set to false.
    quiet: false,
    // It suppress everything except error, so it has to be set to false as well
    // to see success build.
    noInfo: false,
//     https: {
//         cert: fs.readFileSync("/usr/local/etc/nginx/ssl/reddit.crt"),
//         key: fs.readFileSync("/usr/local/etc/nginx/ssl/reddit.key")
// //      cacert: fs.readFileSync("path-to-cacert-file.pem")
//     },
    stats: {
      // Config for minimal console.log mess.
      assets: false,
      colors: true,
      version: false,
      hash: false,
      timings: false,
      chunks: false,
      chunkModules: false
    }
}).listen(3000, 'reddit.dev', function (err) {
    if (err) {
        console.log(err);
    }

  console.log('Listening at reddit.dev:3000');
});