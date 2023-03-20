var webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
var path = require("path");
var env = require("yargs").argv.env;
var merge = require("webpack-merge");
const CircularDependencyPlugin = require("circular-dependency-plugin");
var libraryName = "platform-api";

var plugins = [
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // include specific files based on a RegExp
      include: /src/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd()
    })
  ],
  outputFile;
let additionalSettings = {};

if (env.mode === "build") {
  outputFile = "[name].js";
} else {
  outputFile = "[name].js";
  additionalSettings = {
    devtool: "eval-source-map"
  };
}

var config = {
  mode: "development",
  entry: {
    [libraryName]: __dirname + "/src/index.ts",
    "authentication/index": __dirname + "/src/authentication"
  },
  output: {
    filename: outputFile
  },
  watchOptions: {
    ignored: /(node_modules|types)/
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: [/node_modules/, /^.*\.spec\.tsx$/, /^.*\.spec\.ts$/],
        use: ["babel-loader", "ts-loader"]
      },
      {
        test: /(\.js)$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve("./src"), "node_modules"],
    extensions: [".js", ".ts"],
    fallback: {
      path: require.resolve("path-browserify")
    }
  },
  plugins: plugins,
  ...additionalSettings
};

if (env.mode === "build") {
  config.mode = "production";
  config.optimization = {
    noEmitOnErrors: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      })
    ],
    removeEmptyChunks: true
  };
}

var client = merge(config, {
  target: "web",
  output: {
    path: __dirname + "/lib/client",
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  }
});

var server = merge(config, {
  target: "node",
  output: {
    path: __dirname + "/lib/server",
    libraryTarget: "umd"
  }
});

module.exports = [client, server];
