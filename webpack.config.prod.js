const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HappyPack = require('happypack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

const plugins = [
  new HtmlWebpackPlugin({
    template: 'index.tpl.html',
    inject: 'body',
    filename: 'index.html',
  }),
  new CopyWebpackPlugin([
    { from: 'images', to: 'images' },
  ]),
  new ExtractTextPlugin('styles.css'),
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production'),
    },
  }),
  new HappyPack({
    id: 'babel',
    threads: 4,
    loaders: ['babel-loader'],
  }),
  new UglifyJSPlugin({
    ie8: false,
    output: {
      comments: false,
      beautify: false,
    },
    sourceMap: true,
  }),
  new webpack.HashedModuleIdsPlugin(),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
  }),
];

const modules = {
  rules: [
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader',
      options: {
        configFile: '.eslintrc.json',
        failOnWarning: false,
        failOnError: false,
      },
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'happypack/loader?id=babel',
    },
    {
      test: /\.json?$/,
      loader: 'json-loader',
    },
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        // resolve-url-loader may be chained before sass-loader if necessary
        use: ['css-loader', 'sass-loader'],
      }),
    },
  ],
};

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: [
    path.join(__dirname, 'src/index.js'),
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].[hash].js',
    publicPath: '/',
  },
  context: path.join(__dirname, 'src'),
  devServer: {
    // This is required for older versions of webpack-dev-server
    // if you use absolute 'to' paths. The path should be an
    // absolute path to your build destination.
    outputPath: path.join(__dirname, 'dist'),
  },
  plugins,
  module: modules,
};
