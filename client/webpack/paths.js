const path = require('path');
const fs = require('fs');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

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

function getEnvConfig() {
  const envSpecificFile = `.env.${process.env.NODE_ENV}`;
  if (fs.existsSync(resolveApp(envSpecificFile))) {
    return envSpecificFile;
  }
  return '.env';
}

module.exports = {
  root: resolveApp('.'),
  modules: resolveApp('node_modules'),
  outputPath: resolveApp('dist'),
  entryPath: resolveApp('src/index.js'),
  templatePath: resolveApp('src/index.tpl.html'),
  imagesFolder: 'static/images',
  pwaFolder: 'static/pwa',
  fontsFolder: 'static/fonts',
  cssFolder: 'static/css',
  jsFolder: 'static/js',
  webapp: 'static/webapp',
  dotenv: getEnvConfig(),
  publicPath: ensureSlash(CLIENT_PATH, true),
};
