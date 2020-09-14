const { resolve } = require('path')
const { DefinePlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  output: {
    // client.bundle 主要打包 react, react-dom, react-router-dom
    filename: '[name].[hash:8].js',
    path: resolve('dist'),
    pathinfo: false,
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'inline-cheap-module-source-map' : 'cheap-source-map',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: 'babel-loader',
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [isDev ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new DefinePlugin({
      'process.env.RENDER_ENV': JSON.stringify(process.env.RENDER_ENV),
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
}
