const VueLoaderPlugin = require('vue-loader/lib/plugin')
const { resolve } = require('./utils')
const isDev = process.env.NODE_ENV === 'development'

module.exports = {
  output: {
    // client.bundle 和 server.bundle（bundle.json 中） 主要打包 vue, vuex, vue-router
    filename: '[name].bundle.js',
    path: resolve('../dist'),
  },
  mode: isDev ? 'development' : 'production',
  devtool: isDev ? 'inline-cheap-module-source-map' : 'cheap-source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader'],
      },
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.vue'],
  },
  plugins: [new VueLoaderPlugin()],
}
