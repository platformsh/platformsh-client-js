require("@babel/register")({
  cache: false,
  extensions: [".ts", ".js"],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current"
        }
      }
    ],
    "@babel/preset-typescript"
  ]
});
