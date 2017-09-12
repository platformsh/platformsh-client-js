var webpack = require('webpack');
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
var path = require('path');
var env = require('yargs').argv.env;

var libraryName = 'platform-api';

var plugins = [], outputFile;

if (env.mode === 'build') {
  plugins.push(new UglifyJsPlugin({
    minimize: true,
    compress: {
		    warnings: false,
		    drop_console: true
  	},
  	comments: false
  }));
  outputFile = libraryName + '.min.js';
} else {
  outputFile = libraryName + '.js';
}

var config = {
  entry: {
    [outputFile]:  __dirname + '/src/index.js',
    'authentication/index':  __dirname + '/src/authentication',
  },
  output: {
    path: __dirname + '/lib',
    filename: '[name].js',
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      'node_modules'
    ],
    extensions: ['.js']
  },
  plugins: plugins
};

module.exports = config;
