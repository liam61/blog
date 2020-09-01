import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import { resolve } from 'path'
import fs from 'fs'
import Koa from 'koa'
import koaStatic from 'koa-static'
import ejs from 'ejs'
import { ChunkExtractor } from '@loadable/server'
import { Provider } from 'mobx-react'

const clientStats = resolve('dist/client-loadable-stats.json')
const serverStats = resolve('dist/server-loadable-stats.json')
const template = ejs.compile(fs.readFileSync(resolve('public/index.ssr.html'), 'utf8'))
const app = new Koa()

// 注意访问 / 时，可能会误返回 index.html，打包时要注意
app.use(koaStatic(resolve('dist')))

app.use(async ctx => {
  // console.log(ctx.url)
  try {
    ctx.body = await new Promise((resolve, reject) => {
      // 方法必须写成回调形式，否则样式有问题
      const serverExtractor = new ChunkExtractor({
        statsFile: serverStats,
        entrypoints: ['server'],
      })
      const clientExtractor = new ChunkExtractor({
        statsFile: clientStats,
        entrypoints: ['client'],
      })
      const { default: createApp } = serverExtractor.requireEntrypoint()

      createApp(ctx).then((App: () => JSX.Element) => {
        const markup = clientExtractor.collectChunks(
          <Provider store={ctx.state || {}}>
            <StaticRouter location={ctx.url}>
              <App />
            </StaticRouter>
          </Provider>,
        )
        const html = template({
          __STYLE_TAGS__: `${clientExtractor.getLinkTags()}${clientExtractor.getStyleTags()}`,
          __SCRIPT_TAGS__: `<script>window.__INITIAL_STATE__=${JSON.stringify(
            ctx.state,
          )}</script>${clientExtractor.getScriptTags()}`,
          __APP__: renderToString(markup),
        })

        resolve(html)
      })
    })
  } catch (err) {
    console.log(err)
    ctx.response.status = 404
    ctx.body = '404'
  }
})

app.listen(3000, () => console.log('server is running at http://localhost:3000'))
