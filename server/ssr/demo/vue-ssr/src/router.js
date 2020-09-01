import Vue from 'vue'
import VueRouter from 'vue-router'
import Foo from './components/Foo'

Vue.use(VueRouter)

export default () => {
  return new VueRouter({
    mode: 'history',
    routes: [
      {
        path: '/',
        component: Foo,
      },
      {
        path: '/bar',
        component: () => import(/* webpackChunkName: "bar" */ './components/Bar'), // 异步加载
      },
    ],
  })
}
