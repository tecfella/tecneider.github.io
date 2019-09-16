const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CssExtractPlugin = require("mini-css-extract-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const srcDir = __dirname + "/src";
const buildDir = __dirname + "/build";
const publicDir = __dirname + "/public";

const ifProd = (then, otherwise) =>
  process.env.NODE_ENV === "production" ? then : otherwise;

module.exports = {
  mode: ifProd("production", "development"),
  context: srcDir,
  entry: ["./index"],
  devtool: ifProd(undefined, "source-map"),
  output: {
    path: buildDir,
    filename: ifProd("main.[contenthash].js", "main.js"),
    chunkFilename: ifProd("[name].[contenthash].js", "[name].js")
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: "initial",
          name: "vendor",
          enforce: true
        }
      }
    }
  },
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "babel-loader"
          },
          {
            test: /\.module\.css$/,
            exclude: /node_modules/,
            use: [
              ifProd(CssExtractPlugin.loader, "style-loader"),
              {
                loader: "css-loader",
                options: {
                  modules: true,
                  localIdentName: "[local]__[hash:base64:5]"
                }
              }
            ]
          },
          {
            test: /\.css$/,
            exclude: /node_modules/,
            loaders: ["style-loader", "css-loader"]
          }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: `${publicDir}/index.html`
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new CopyWebpackPlugin(
      [{ from: `${publicDir}/**/*` }, { from: `${publicDir}/.nojekyll` }],
      { context: publicDir, dot: true }
    ),
    new CssExtractPlugin({ filename: "[name].[contenthash].css" })
  ],
  stats: ifProd("normal", "minimal")
};
