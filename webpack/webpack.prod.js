const webpack = require('webpack');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const commonPaths = require('./paths');

module.exports = {
  mode: 'production',
  output: {
    filename: `${commonPaths.jsFolder}/[name].[hash].js`,
    path: commonPaths.outputPath,
    publicPath: '/',
    chunkFilename: '[name].[chunkhash].js',
  },
  module: {
    rules: [],
  },
  plugins: [new CleanWebpackPlugin()],
  devtool: 'source-map',
};
