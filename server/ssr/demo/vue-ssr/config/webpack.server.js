const merge = require('webpack-merge');
const base = require('./webpack.base');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ServerRenderPlugin = require('vue-server-renderer/server-plugin');
const { resolve } = require('./utils');

module.exports = merge(base, {
  entry: {
    server: resolve('../src/server-entry.js'),
  },
  target: 'node', // 声明给 node 使用
  output: {
    libraryTarget: 'commonjs2', // 把导出的结果放到 module.exports 上
  },
  plugins: [
    new ServerRenderPlugin(),
  ],
});
