const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebappWebpackPlugin = require('webapp-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const Dotenv = require('dotenv-webpack');
const commonPaths = require('./paths');

module.exports = {
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        loader: 'eslint-loader',
        exclude: /(node_modules)/,
        options: {
          emitWarning: process.env.NODE_ENV !== 'production',
          formatter: require('eslint-formatter-pretty'),
        },
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/,
        options: { cacheDirectory: true },
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
              outputPath: commonPaths.imagesFolder,
            },
          },
        ],
      },
      {
        test: /\.(woff2|ttf|woff|eot)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: commonPaths.fontsFolder,
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
    new Dotenv(),
    new WebappWebpackPlugin({
      prefix: commonPaths.webapp,
      logo: commonPaths.icon, // svg works too!
      favicons: {
        background: '#343a40',
        theme_color: '#343a40',
        appleStatusBarStyle: 'black',
        icons: {
          coast: false,
          yandex: false,
          firefox: false,
          mstile: false,
        },
      },
    }),
    new WatchMissingNodeModulesPlugin(commonPaths.modules),

    new MiniCssExtractPlugin({
      filename: `${commonPaths.cssFolder}/[name].[contenthash:8].css`,
      chunkFilename: `${
        commonPaths.cssFolder
      }/[name].[contenthash:8].chunk.css`,
    }),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      // publicPath: commonPaths.root,
    }),
  ],
};
