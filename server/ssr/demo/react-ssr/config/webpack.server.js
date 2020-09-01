const { resolve } = require('path')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const LoadablePlugin = require('@loadable/webpack-plugin')
const base = require('./webpack.base')

module.exports = merge(base, {
  entry: {
    server: resolve('src/server-entry.ts'),
  },
  target: 'node',
  output: {
    libraryTarget: 'commonjs2', // 把导出的结果放到 module.exports 上
  },
  externals: ['@loadable/component', 'bar', nodeExternals()],
  plugins: [
    new LoadablePlugin({
      filename: 'server-loadable-stats.json',
    }),
  ],
})
