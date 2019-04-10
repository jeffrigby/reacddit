const path = require('path');

module.exports = {
  root: path.resolve(__dirname, '../'),
  modules: path.resolve('node_modules'),
  outputPath: path.resolve(__dirname, '../', 'dist'),
  entryPath: path.resolve(__dirname, '../', 'src/index.js'),
  templatePath: path.resolve(__dirname, '../', 'src/index.tpl.html'),
  favicon: path.resolve(__dirname, '../', 'src/images/favicon.ico'),
  icon: path.resolve(__dirname, '../', 'src/images/icon.png'),
  imagesFolder: 'static/images',
  fontsFolder: 'static/fonts',
  cssFolder: 'static/css',
  jsFolder: 'static/js',
  webapp: 'static/webapp',
};
