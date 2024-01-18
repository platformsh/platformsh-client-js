const path = require("path");

const webpack = require("webpack");
const { merge } = require("webpack-merge");

module.exports = env => {
  const libraryName = "platform-api";

  const plugins = [
    new webpack.ProvidePlugin({
      process: "process/browser"
    })
  ];

  const additionalSettings = {};

  if (env.mode !== "build") {
    additionalSettings.devtool = "eval-source-map";
  }

  const config = {
    mode: "development",
    entry: {
      [libraryName]: `${__dirname}/src/index.ts`,
      "authentication/index": `${__dirname}/src/authentication`
    },
    watchOptions: {
      ignored: /(node_modules|types)/u
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
      extensions: [".js", ".ts"],
      fallback: {
        buffer: require.resolve("buffer/"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        path: require.resolve("path-browserify"),
        "process/browser": require.resolve("process/browser"),
        url: require.resolve("url/")
      }
    },
    plugins,
    ...additionalSettings
  };

  if (env.mode === "build") {
    config.mode = "production";
    config.optimization = {
      emitOnErrors: false,
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

  return [client, server];
};
