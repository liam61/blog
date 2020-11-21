import { useMemo } from 'react'
import { useLocalStore } from 'mobx-react'
import { Loadx, ActionConfig, createLoadxFn } from './loadx'
import { isPlainObject } from 'lodash'
import { FnType, LoadxLoadFnType, LoadxStore } from './types'

export interface LoadxLocaleStore<S> {
  store: LoadxStore<S>
  loading: boolean
  bind: {
    <T extends FnType>(
      fn: T,
      config?: Omit<ActionConfig, 'loadx'>,
      context?: any,
    ): LoadxLoadFnType<T>
    <T extends FnType>(fn: T, context?: any): LoadxLoadFnType<T>
  }
  setConfig: (config: ActionConfig) => void
}

export function useLoadx<T extends Record<string, any>, P extends Record<string, any>>(
  initializer: (source: P & { loadx: Loadx }) => T,
  loadxConfig?: ActionConfig,
  current?: P,
): LoadxLocaleStore<T> {
  const loadx = useMemo(() => new Loadx(loadxConfig), [])
  current && ((current as any).loadx = loadx)
  const store = useLocalStore(initializer, current)

  return {
    store,
    loading: loadx.loading,
    bind: (fn: T, config = {}, context: any = null) => {
      // 不传 config
      if (!isPlainObject(config)) {
        context = config
        config = {}
      }
      return createLoadxFn(fn, { ...config, loadx: loadx }, context || store) as any
    },
    setConfig: config => loadx.setConfig(config),
  }
}
