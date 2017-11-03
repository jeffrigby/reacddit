const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hotOnly: true,
  historyApiFallback: true,
  quiet: false,
  noInfo: true,
  stats: 'minimal',
}).listen(3000, 'reddit.dev', (err) => {
  if (err) {
    console.log(err);
  }
  console.log('Listening at reddit.dev:3000');
});
