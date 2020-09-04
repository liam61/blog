const { resolve } = require('path')
const { DefinePlugin } = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  output: {
    // client.bundle 主要打包 react, react-dom, react-router-dom
    filename: '[name].[hash:8].js',
    path: resolve('dist'),
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
        use: [isDev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader'],
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
  ],
}
