const path = require('path');

require('dotenv').config();

const { PROD_PUBLIC_PATH, DEV_PUBLIC_PATH } = process.env;

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
  favicon: path.resolve(__dirname, '../', 'src/images/favicon.ico'),
  icon: path.resolve(__dirname, '../', 'src/images/icon.png'),
  imagesFolder: 'static/images',
  fontsFolder: 'static/fonts',
  cssFolder: 'static/css',
  jsFolder: 'static/js',
  webapp: 'static/webapp',
  publicProdPath: ensureSlash(PROD_PUBLIC_PATH, true),
  publicDevPath: ensureSlash(DEV_PUBLIC_PATH, true),
};
