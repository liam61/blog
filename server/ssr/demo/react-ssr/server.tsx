import React from 'react'
import { renderToString } from 'react-dom/server'
import { resolve } from 'path'
import fs from 'fs'
import Koa from 'koa'
import koaStatic from 'koa-static'
import ejs from 'ejs'
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server'
import createApp from './dist/server.js'

const clientStats = resolve('dist/loadable-stats.json')
const template = ejs.compile(fs.readFileSync(resolve('public/index.ssr.html'), 'utf8'))
const app = new Koa()

// 注意访问 / 时，可能会误返回 index.html，打包时要注意
app.use(koaStatic(resolve('dist')))

app.use(async ctx => {
  // console.log(ctx.url)
  if (ctx.url === '/favicon.ico') {
    ctx.response.status = 200
    return
  }

  try {
    ctx.body = await new Promise((resolve, reject) => {
      // 方法必须写成回调形式，否则样式有问题
      const clientExtractor = new ChunkExtractor({
        statsFile: clientStats,
        entrypoints: 'client',
      })

      createApp(ctx).then(({ App, state }) => {
        // clientExtractor.collectChunks
        const markup = (
          <ChunkExtractorManager extractor={clientExtractor}>
            <App />
          </ChunkExtractorManager>
        )

        const html = template({
          __STYLE_TAGS__: `${clientExtractor.getLinkTags()}${clientExtractor.getStyleTags()}`,
          __SCRIPT_TAGS__: `<script>window.__INITIAL_STATE__=${JSON.stringify(
            state,
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
