import type { Configuration } from "webpack";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

rules.push({
  test: /\.css$/,
  use: [
    { loader: "style-loader" },
    { loader: "css-loader" },
    { loader: "postcss-loader" },
  ],
});

export const rendererConfig: Configuration = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  module: {
    rules,
  },
  plugins,
  resolve: {
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
    fallback: {
      // Node.js polyfills for browser environment
      assert: require.resolve("assert"),
      buffer: require.resolve("buffer"),
      crypto: require.resolve("crypto-browserify"),
      events: require.resolve("events"),
      path: require.resolve("path-browserify"),
      process: require.resolve("process/browser"),
      querystring: require.resolve("querystring-es3"),
      stream: require.resolve("stream-browserify"),
      url: require.resolve("url"),
      util: require.resolve("util"),
      fs: false,
      net: false,
      tls: false,
    },
  },
  target: "electron-renderer",
  externals: {
    electron: "commonjs2 electron",
  },
};
