import type IForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require("copy-webpack-plugin");

export const plugins = [
  // Copy public assets to output directory
  new CopyWebpackPlugin({
    patterns: [
      {
        from: "public",
        to: ".",
        globOptions: {
          ignore: ["**/index.html"], // Don't copy index.html as it's handled by HtmlWebpackPlugin
        },
      },
    ],
  }),
  // Temporarily disabled to fix startup issues
  // new ForkTsCheckerWebpackPlugin({
  //   logger: "webpack-infrastructure",
  // }),
];
