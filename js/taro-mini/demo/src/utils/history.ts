import { navigateTo, navigateBack, redirectTo, reLaunch } from '@tarojs/taro'
import qs from 'qs'
import { syncPromise, THEN_ALL } from './thenSync'
import { cache } from './cache'
import { preloadApi } from '@/api'
import { timer } from '.'

const _history = {
  go(url, params) {
    return navigateTo({ url, ...params })
  },
  back(delta, params) {
    return navigateBack({ delta, ...params })
  },
  replace(url, params) {
    return redirectTo({ url, ...params })
  },
  reload(url, params) {
    return reLaunch({ url, ...params })
  },
}

function preload(h: Record<string, any>) {
  ;['go', 'replace', 'reload'].forEach(type => {
    const fn = h[type]
    h[type] = (url, params) => {
      const { query = {}, ...restParams } = params
      const apis = preloadApi[url]

      const start = Date.now()
      timer.start = start
      !query.force && console.log('预请求 api：', start)
      if (!query.force && Array.isArray(apis)) {
        // 是否为 Promise.all 的预请求
        const isAll = apis.length > 1
        const promises = apis.reduce((arr, api) => {
          // 给 api 传参
          const p = api(query)
          isAll && (p[THEN_ALL] = `${url}all`)
          arr.push(p)
          cache[p.url] = isAll ? p : syncPromise(p)
          return arr
        }, [])
        // 多存一个 all 的 api
        isAll && (cache[`${url}all`] = syncPromise(Promise.all(promises)))
      }

      // call original
      fn.apply(h, [`${url}?${qs.stringify(query)}`, restParams])
    }
  })
  return h
}

interface HistoryParams {
  query?: Record<string, any>
  success?: (res: any) => any
  fail?: (res: any) => any
  complete?: (res: any) => any
}

const $history = preload(_history)

export default $history as {
  go(url: string, params?: HistoryParams): Promise<Taro.General.CallbackResult>
  back(delta: number, params?: HistoryParams): Promise<Taro.General.CallbackResult>
  replace(url: string, params?: HistoryParams): Promise<Taro.General.CallbackResult>
  reload(url: string, params?: HistoryParams): Promise<Taro.General.CallbackResult>
}
