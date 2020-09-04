const { resolve } = require('path')
const merge = require('webpack-merge')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LoadablePlugin = require('@loadable/webpack-plugin')
const base = require('./webpack.base')
const isSSR = process.env.RENDER_ENV === 'ssr'

module.exports = merge(base, {
  entry: {
    client: resolve('src/client-entry.tsx'),
  },
  plugins: [
    !isSSR &&
      new HtmlWebpackPlugin({
        template: 'public/index.csr.html',
      }),
    new LoadablePlugin(),
  ].filter(Boolean),
  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all',
    },
  },
})
