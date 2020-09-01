// 客户端入口
import createApp from './main.js'

const { app, store } = createApp()

// const vueMixin = {
//   beforeRouteUpdate(to, from, next) {
//     const { asyncData } = this.$options
//     if (asyncData) {
//       asyncData({ store: this.$store })
//         .then(next)
//         .catch(next)
//     } else {
//       next()
//     }
//   },
// }

// ssr 时，要将浏览器的 store 替换为 server 挂在 window 的状态
if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
  store.replaceState(window.__INITIAL_STATE__)
}

// 绑定事件
app.$mount('#app')
