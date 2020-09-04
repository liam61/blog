const { resolve } = require('path')
const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const base = require('./webpack.base')

module.exports = merge(base, {
  entry: {
    server: resolve('src/server-entry.tsx'),
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2', // 把导出的结果放到 module.exports 上
  },
  target: 'node',
  externals: ['@loadable/component', nodeExternals()],
})
