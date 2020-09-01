// 服务端入口，打在 server.bundle.js 中
import createApp from './main.js'

// 服务端渲染，每个人都应该生成 vue 实例
export default ctx => {
  // 返回一个 promise 是为了异步组件能很好的调用
  return new Promise((resolve, reject) => {
    const { app, router, store } = createApp()
    // 根据服务器传来的 url 渲染对应的界面
    router.push(ctx.url)
    // router 跳转完后才渲染
    router.onReady(() => {
      const matches = router.getMatchedComponents() // 获取当前跳转的匹配的组件
      if (matches.length === 0) {
        reject({ code: 404 })
      }

      Promise.all(
        matches.map(cmp => typeof cmp.asyncData === 'function' && cmp.asyncData(store)),
      ).then(() => {
        // 所有异步数据获取完后再返回渲染的界面
        // Promise.all 中的方法会改变 store 中的 state
        // vuex 会将 ctx 的 state 挂在到 window 上，方便前端获取
        ctx.state = store.state
        resolve(app)
      })
    }, reject)
  })
}
