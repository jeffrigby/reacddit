const commonPaths = require('./paths');

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
  },
  module: {},
  plugins: [],
};
