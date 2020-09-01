import Vue from 'vue'
import App from './App.vue'
import createRouter from './router'
import createStore from './store'

// 入口文件 提供 vue 实例
// const vm = new Vue({
//   el: '#app',
//   render: h => h(App),
// });

export default () => {
  const router = createRouter()
  const store = createStore()
  const app = new Vue({
    // el: '#app',
    render: h => h(App),
    router,
    store,
  })
  return { app, router, store }
}
