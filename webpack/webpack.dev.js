const commonPaths = require('./paths');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CleanTerminalPlugin = require('clean-terminal-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');

module.exports = {
  mode: 'development',
  output: {
    filename: '[name].js',
    path: commonPaths.outputPath,
    publicPath: '/',
    chunkFilename: '[name].js',
  },
  devServer: {
    contentBase: commonPaths.outputPath,
    historyApiFallback: true,
    compress: true,
    stats: 'normal',
    clientLogLevel: 'none',
    watchContentBase: true,
    quiet: true,
    overlay: false,
  },
  devtool: 'cheap-module-source-map',
  module: {},
  plugins: [
    // new CleanTerminalPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new ErrorOverlayPlugin(),
  ],
};
