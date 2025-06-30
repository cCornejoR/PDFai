import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import webpack from "webpack";
import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";

export const plugins = [
  // TypeScript type checking
  new ForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),

  // Copy public assets to output directory
  new CopyWebpackPlugin({
    patterns: [
      {
        from: "public",
        to: ".",
        globOptions: {
          ignore: ["**/index.html"],
        },
      },
    ],
  }),

  // Provide Node.js globals for browser environment
  new webpack.ProvidePlugin({
    Buffer: ["buffer", "Buffer"],
    process: "process/browser",
  }),

  // Define environment variables
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  }),
];
