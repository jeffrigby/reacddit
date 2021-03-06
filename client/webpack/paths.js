const path = require('path');

require('dotenv').config();

const { CLIENT_PATH } = process.env;

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  }

  if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  }

  return inputPath;
}

module.exports = {
  root: path.resolve(__dirname, '../'),
  modules: path.resolve('node_modules'),
  outputPath: path.resolve(__dirname, '../', 'dist'),
  entryPath: path.resolve(__dirname, '../', 'src/index.js'),
  templatePath: path.resolve(__dirname, '../', 'src/index.tpl.html'),
  imagesFolder: 'static/images',
  pwaFolder: 'static/pwa',
  fontsFolder: 'static/fonts',
  cssFolder: 'static/css',
  jsFolder: 'static/js',
  webapp: 'static/webapp',
  publicPath: ensureSlash(CLIENT_PATH, true),
};
