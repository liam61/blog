import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default () => {
  const store = new Vuex.Store({
    state: {
      name: 'no-name',
      num: 0,
    },
    // 改变状态
    mutations: {
      setName(state, payload) {
        const { name } = payload
        state.name = name
      },
      addNum(state) {
        state.num++
      },
    },
    // 异步请求
    actions: {
      fetchName({ commit }, { name }) {
        return new Promise((resolve, reject) => {
          // 模拟 api
          setTimeout(() => {
            commit('setName', { name })
            resolve()
          }, 500)
        })
      },
      changeNum({ commit }) {
        commit('addNum')
      },
    },
  })

  return store
}
