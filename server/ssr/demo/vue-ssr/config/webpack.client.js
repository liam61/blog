const merge = require('webpack-merge')
const base = require('./webpack.base')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ClientRenderPlugin = require('vue-server-renderer/client-plugin')
const { resolve } = require('./utils')
const isDev = process.env.NODE_ENV === 'development'

module.exports = merge(base, {
  entry: {
    client: resolve('../src/client-entry.js'),
  },

  plugins: [
    isDev &&
      new HtmlWebpackPlugin({
        template: resolve('../public/index.html'),
      }),
    new ClientRenderPlugin(),
  ].filter(Boolean),
})
