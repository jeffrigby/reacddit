const commonPaths = require('./paths');
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin');
const CreateFileWebpack = require('create-file-webpack');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [commonPaths.entryPath],
  output: {
    filename: '[name].js',
    path: commonPaths.outputPath,
    publicPath: '/',
    chunkFilename: '[name].js',
  },
  devServer: {
    contentBase: commonPaths.outputPath,
    historyApiFallback: {
      // Paths with dots should still use the history fallback.
      // See https://github.com/facebook/create-react-app/issues/387.
      disableDotRule: true,
    },
    compress: true,
    stats: 'normal',
    clientLogLevel: 'none',
    watchContentBase: true,
    quiet: true,
    overlay: false,
    public: commonPaths.publicPath,
    disableHostCheck: true,
    publicPath: '/',
    port: 3000,
    hot: true,
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: commonPaths.templatePath,
    }),
    new webpack.DefinePlugin({
      BUILDTIME: Date.now(),
    }),
    new CreateFileWebpack({
      path: commonPaths.outputPath,
      fileName: 'build.json',
      content: JSON.stringify({ version: 'dev' }),
    }),
    // new CleanTerminalPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CaseSensitivePathsPlugin(),
    new ErrorOverlayPlugin(),
  ],
};
