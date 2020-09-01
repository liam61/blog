const Koa = require('koa')
const koaStatic = require('koa-static')
const fs = require('fs')
const path = require('path')
const VueServerRenderer = require('vue-server-renderer')
const serverBundle = require('./dist/vue-ssr-server-bundle.json')
const clientManifest = require('./dist/vue-ssr-client-manifest.json')

const app = new Koa()

const template = fs.readFileSync('./public/index.ssr.html', 'utf8')
const render = VueServerRenderer.createBundleRenderer(serverBundle, {
  template, // 读取 server 打包后的 html 文件，并替换掉 <!--vue-ssr-outlet-->
  clientManifest, // 渲染的时候可以找到客户端的 js 文件，自动引入的 server 的 html 中
})

// 注意访问 / 时，可能会误返回 index.html，打包时要注意
app.use(koaStatic(path.join(__dirname, 'dist')))

app.use(async ctx => {
  try {
    ctx.body = await new Promise((resolve, reject) => {
      // 方法必须写成回调形式，否则样式有问题
      // 里面会将 server-entry 传来的 app renderToString
      // url: 指定访问前端路由，加载对应组件
      render.renderToString({ url: ctx.url }, (err, html) => {
        if (err) reject(err)
        resolve(html)
      })
    })
  } catch (err) {
    ctx.response.status = 404
    ctx.body = '404'
  }
})

app.listen(3000, () => console.log('server is running at http://localhost:3000'))
