const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './bin/index.js',
  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.js']
  },
  externals: {
    // External modules that should not be bundled
    'node:sqlite': 'commonjs2 node:sqlite',
    'node:sea': 'commonjs2 node:sea'
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
