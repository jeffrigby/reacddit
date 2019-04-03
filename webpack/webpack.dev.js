const commonPaths = require('./paths');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
  },
  devtool: 'cheap-module-source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: /node_modules/,
        use: ['react-hot-loader/webpack'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: commonPaths.templatePath,
    }),
    // new CleanTerminalPlugin(),
    new FriendlyErrorsWebpackPlugin(),
    new ErrorOverlayPlugin(),
  ],
};
