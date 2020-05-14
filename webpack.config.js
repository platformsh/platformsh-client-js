var webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
var path = require("path");
var env = require("yargs").argv.env;
var merge = require("webpack-merge");

var libraryName = "platform-api";

var plugins = [],
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
    [libraryName]: __dirname + "/src/index.js",
    "authentication/index": __dirname + "/src/authentication"
  },
  output: {
    filename: outputFile
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        use: "babel-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve("./src"), "node_modules"],
    extensions: [".js"]
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
