const { resolve } = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const base = require('./webpack.base')
const isDev = process.env.NODE_ENV === 'development'

module.exports = merge(base, {
  entry: {
    client: resolve('src/client-entry.tsx'),
  },
  plugins: [
    isDev &&
      new HtmlWebpackPlugin({
        template: 'public/index.csr.html',
      }),
    new LoadablePlugin({
      filename: 'client-loadable-stats.json',
    }),
  ].filter(Boolean),
})
