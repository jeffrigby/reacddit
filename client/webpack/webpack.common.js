const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const eslintFormatter = require('react-dev-utils/eslintFormatter');
const paths = require('./paths');

module.exports = {
  target: 'web',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        // include: src',
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
            options: {
              // Pass the formatter:
              emitWarning: process.env.NODE_ENV !== 'production',
              formatter: eslintFormatter,
            },
          },
        ],
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        options: { cacheDirectory: true, envName: 'browser' },
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              // minimize: true,
              // modules: true,
              // camelCase: true,
              // localIdentName: '[local]___[hash:base64:5]',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
              outputPath: paths.imagesFolder,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: ['src', 'node_modules'],
    extensions: ['*', '.js', '.jsx', '.css', '.scss'],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new Dotenv({
      defaults: true,
      path: paths.dotenv,
    }),

    new CopyPlugin({
      patterns: [{ from: `${paths.appPath}/src/PWA`, to: paths.pwaFolder }],
    }),

    new WatchMissingNodeModulesPlugin(paths.appNodeModules),

    new MiniCssExtractPlugin({
      filename: `${paths.cssFolder}/[name].[contenthash:8].css`,
      chunkFilename: `${paths.cssFolder}/[name].[contenthash:8].chunk.css`,
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      // publicPath: paths.appPath,
    }),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    module: 'empty',
    dgram: 'empty',
    dns: 'mock',
    fs: 'empty',
    http2: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
