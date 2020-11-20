# 服务端渲染（ssr）React & Vue Demo

## 基本思想

1. 客服端和服务端共用一套代码，但根据环境配置不同的 `entry` 和 `webpack config`

2. 服务端使用加载 `routes`，启动服务器监听 `request.url` 去 `match` 对应的 `Components`，并请求其 `getInitialProps`

3. 使用 `renderToString` 吐出 `markup`，并初始化 `store`，通过 `window.__INITIAL_STATE__` 注水到 `html` 中

4. 客户端拿到 `html` 后请求 `client-entry.js`，然后调用 `hydrate` 胶水合成 `dom` 和 `events`

5. 通过 `__INITIAL_STATE__` 拿到最新状态并更新 `store`

6. 另外，可利用 `@loadable/component` 这个包可以帮助实现 `SSR` 下的异步 `chunk`

## 实现

### 客户端打包

1. webpack.client.js

```js
module.exports = {
  entry: {
    client: resolve('src/client-entry.tsx'),
  },
  output: {
    // client.bundle 主要打包 react, react-dom, react-router-dom
    filename: '[name].[hash:8].js',
    path: resolve('dist'),
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        ...
      },
      {
        test: /\.css$/,
        ...
      },
    ],
  },
  plugins: [
    new LoadablePlugin(),
  ],
}
```

2. client-entry.tsx

```js
import { loadableReady } from '@loadable/component'

const _App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter><App /></BrowserRouter>
    </Provider>
  )
}
loadableReady(() => hydrate(<_App />, container))
```

### 服务端打包

1. webpack.server.js

```js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: {
    server: resolve('src/server-entry.tsx'),
  },
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  externals: ['@loadable/component', nodeExternals()],
}
```

2. server-entry.tsx

```js
import { matchPath } from 'react-router-dom'

export default ctx => {
  return new Promise((resolve, reject) => {
    // match 的 Components
    const matches = routes
      .filter(route => matchPath(ctx.url, route))
      .map(route => route.component || route.render)

    if (!matches.length) {
      throw new Error('no Component match')
    }

    Promise.all(
      matches.map(Cmp => Cmp.getInitialProps && Cmp.getInitialProps(ctx)),
    ).then(states => {
      const state = states.reduce((obj, state) => Object.assign(obj, state), {})
      const _App = () => (
        <Provider store={state}>
          <StaticRouter location={ctx.url}>
            <App />
          </StaticRouter>
        </Provider>
      )

      resolve({ App: _App, state })
    })
  })
}
```

### 启动服务器

server.tsx

```js
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server'
import createApp from './dist/server.js'

const app = new Koa()

app.use(async ctx => {
  ctx.body = await new Promise((resolve, reject) => {
    const clientExtractor = new ChunkExtractor({
      statsFile: clientStats,
      entrypoints: 'client',
    })

    // server-entry.tsx 的默认导出
    createApp(ctx).then(({ App, state }) => {
      const markup = (
        // 分拣出依赖的异步 chunk
        <ChunkExtractorManager extractor={clientExtractor}>
          <App />
        </ChunkExtractorManager>
      )
      const html = template({
        __STYLE_TAGS__: `${clientExtractor.getLinkTags()}${clientExtractor.getStyleTags()}`,
        // 注水
        __SCRIPT_TAGS__: `<script>window.__INITIAL_STATE__=${JSON.stringify(
          state,
        )}</script>${clientExtractor.getScriptTags()}`,
        __APP__: renderToString(markup),
      })
      resolve(html)
    })
  })
})

app.listen(3000)
```

### CSR 单独开发

判断是否为 SSR 环境，配合 `history` 自己实现 `getInitialProps`

client-entry.tsx

```js
import { useRouteMatch } from 'react-router-dom'

const isSSR = process.env.RENDER_ENV === 'ssr'
const AppClient = () => {
  const matches = routes
    .filter(route => useRouteMatch(route))
    .map(route => route.component || route.render)

  Promise.all(
    matches.map(
      (Cmp: any) => typeof Cmp.getInitialProps === 'function' && Cmp.getInitialProps(store),
    ),
  ).then(states => {
    const state = states.reduce((obj, state) => Object.assign(obj, state), {})
    store.update(state)
  })

  return <App />
}

const _App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter><AppClient /></BrowserRouter>
    </Provider>
  )
}

render(<_App />, document.getElementById('app'))
```

## Demo 使用

```bash
cd ./server/ssr/demo/react-ssr
yarn
yarn serve // ssr
yarn dev:client // csr
```


## 最后

1. 源码获取：[ssr React & Vue Demo](https://github.com/lawler61/blog/tree/master/server/ssr/demo)

2. 喜欢的小伙伴，记得留下你的小 ❤️ 哦~

## 参考资料

- [loadable-components](https://loadable-components.com/docs/getting-started/)
