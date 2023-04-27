const path = require("path");

const TerserPlugin = require("terser-webpack-plugin");
const merge = require("webpack-merge");
const { env } = require("yargs").argv;

const libraryName = "platform-api";

const plugins = [];
let outputFile;
let additionalSettings = {};

if (env.mode === "build") {
  outputFile = "[name].js";
} else {
  outputFile = "[name].js";
  additionalSettings = {
    devtool: "eval-source-map"
  };
}

const config = {
  mode: "development",
  entry: {
    [libraryName]: `${__dirname}/src/index.ts`,
    "authentication/index": `${__dirname}/src/authentication`
  },
  output: {
    filename: outputFile
  },
  watchOptions: {
    ignored: [/node_modules/u, /types/u]
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/u,
        exclude: [/node_modules/u, /^.*\.spec\.tsx$/u, /^.*\.spec\.ts$/u],
        use: ["babel-loader", "ts-loader"]
      },
      {
        test: /(\.js)$/u,
        use: "babel-loader",
        exclude: /node_modules/u
      }
    ]
  },
  resolve: {
    modules: [path.resolve("./src"), "node_modules"],
    extensions: [".js", ".ts"]
  },
  plugins,
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

const client = merge(config, {
  target: "web",
  output: {
    path: `${__dirname}/lib/client`,
    library: libraryName,
    libraryTarget: "umd",
    umdNamedDefine: true
  }
});

const server = merge(config, {
  target: "node",
  output: {
    path: `${__dirname}/lib/server`,
    libraryTarget: "umd"
  }
});

module.exports = [client, server];
