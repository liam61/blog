<template>
  <div>
    Foo
    <button @click="clickMe">点击 {{this.$store.state.num}}</button>
    <p>{{this.$store.state.name}}</p>
  </div>
</template>

<style scoped>
</style>

<script>
export default {
  mounted() {
    // 服务端没有 mounted 钩子
    // 路由切换时，调用 mounted 采用前端渲染
    this.$store.dispatch('fetchName', { name: 'name-by-mount' })
  },
  asyncData({ dispatch } /* store */) {
    // 相当于 react getInitialProps
    return dispatch('fetchName', { name: 'name-by-asyncData' }) // 第一次服务端调，模拟延迟请求数据
  },
  methods: {
    clickMe() {
      const { dispatch, state } = this.$store
      dispatch('changeNum')
      dispatch('fetchName', {
        name: `eventName-${state.num}`,
      })
      console.log('click a button')
    },
  },
}
</script>
