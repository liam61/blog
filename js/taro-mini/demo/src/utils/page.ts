import { getCurrentPages } from '@tarojs/taro'

let _currentPage: Taro.Page = {} as any

/**
 * 获取当前 page 信息
 */
const $page = {
  get() {
    return _currentPage
  },
  update() {
    const pages = getCurrentPages()
    _currentPage = pages[pages.length - 1] || {}
  },
  /**
   * @param {string} key 'a.b.c'
   * @param {Record<string, any>} source
   * @param {boolean} [force=true] 混合开发时, reRender Taro 界面
   */
  setData(key: string, source: Record<string, any>, force = false) {
    // TODO: a.b.c 的情况
    _currentPage.setData({ [key]: source })
    force && _currentPage.$component.forceUpdate()
  },
  /**
   * @param keys 'a.b.c' or 'a', 'b', 'c'
   */
  getData(...keys: string[]) {
    if (keys.length === 0) return undefined
    return getDataByPath(keys[0].includes('.') ? keys[0] : keys.join('.'), _currentPage.data)
  },
}

function getDataByPath(path: string, source: Record<string, any> = {}) {
  const keys = path.split('.')
  return keys.reduce((ret, k) => {
    if (ret == null || !ret[k]) return undefined
    return ret[k]
  }, source)
}

export default $page
