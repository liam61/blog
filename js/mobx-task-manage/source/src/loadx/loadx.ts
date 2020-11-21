import { createAtom, runInAction, IAtom } from 'mobx'
import { createPropDecorator, addHiddenProp, getUid } from './utils'
import { LoadxConfig, LoadxLoadType, LoadxLoadFnType, FnType } from './types'
import { keys, isPlainObject, has, isObject } from 'lodash'

// 调用 action 的 config
export interface ActionConfig {
  loadx?: string | Loadx // // 关联的 store Loadx
  action?: string // action name
  observe?: boolean // 设置是否监听 loading 变化，默认为 true
  preload?: boolean | number
  onError?: (err: any, ...originalArgs: any[]) => void | Promise<void> // error 回调
  onComplete?: (resOrErr?: any, ...originalArgs: any[]) => void | Promise<void> // complete 回调
}

export interface ActionFactory {
  // named decorator
  (config: ActionConfig): (
    target: Record<string, any>,
    key: PropertyKey,
    descriptor?: PropertyDescriptor,
  ) => void
  // normal decorator
  (target: Record<string, any>, propertyKey: PropertyKey, descriptor?: PropertyDescriptor): void
}

export function createLoadxFn(fn: any, config: ActionConfig = {}, context: any = null) {
  const id = getUid()
  return function (this: any, ...args: any[]) {
    const that = context || this
    const {
      loadx: lName = '',
      action: acName = fn.name ? `loadx-${fn.name}-effect` : `loadx-${id}-effect`,
      // observe = true,
      onComplete,
      onError,
    } = config
    // eslint-disable-next-line
    const name = keys(that).find(k => that[k] instanceof Loadx) || ''
    const loadx: Loadx = (typeof lName === 'string' ? that[lName] : lName) || that[name]
    const req = runInAction(fn.name ? `loadx-${fn.name}` : `loadx-${id}`, () =>
      fn.apply(that, args),
    )

    req._action = acName
    req._args = args
    // req._observe = observe
    onError && (req._onError = onError.bind(that))
    onComplete && (req._onComplete = onComplete.bind(that))

    return loadx ? loadx.load(req) : req
  }
}

export class Loadx {
  /**
   * @action(ActionConfig) fn
   * @action fn
   */
  static action: ActionFactory = createPropDecorator(function (target, prop, descriptor, args) {
    // cannot decorate class
    if (!prop) return

    // @action fn() {}
    if (descriptor) {
      // cannot decorate getter/setter
      if (descriptor.get || descriptor.set) return descriptor

      return {
        configurable: true,
        enumerable: false,
        get() {
          const fn = descriptor.value || (descriptor as any).initializer.call(this)
          addHiddenProp(this, prop, createLoadxFn(fn, args[0], this))
          return this[prop]
        },
        set() {
          console.warn('@action fields are not reassignable')
        },
      }
    } else {
      // @action fn = () => {}
      Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: false,
        get() {
          return undefined
        },
        set(fn) {
          addHiddenProp(this, prop, createLoadxFn(fn, args[0], this))
        },
      })
    }
  })

  name: string
  private observe!: boolean // 是否 reportChange
  private atom: IAtom
  requests: Promise<any>[] = []
  private preload: number | boolean = false
  private preloadFn: (() => void) | null = null

  constructor(config?: LoadxConfig) {
    const { name = `loadx-${getUid()}`, requests, preload = false, observe = true } = config || {}
    this.name = name
    this.atom = createAtom(name)
    this.setConfig({ preload, observe })
    requests && requests.forEach(p => this.load(p))
  }

  get loading() {
    this.atom.reportObserved()
    return !!this.requests.length
  }

  /**
   * 传 Thenable, Generator, GeneratorFunction
   */
  load<T>(request: T): LoadxLoadType<T> {
    const { _action = '', _onError, _onComplete, _args } = request as any
    const { length: preLen } = this.requests

    const thenable: any = Promise.resolve(request)
    this.requests.push(thenable)

    if (!preLen) {
      // 第一个进来的 request 的 observe 状态会贯穿整个请求链
      // this.isObserve = _observe
      this.observe && this.atom.reportChanged()
    } else if (preLen === 1) {
      // 如果有 preload 则现在进来的才是真正第一个请求，此时结束 preload
      if (this.preloadFn && this.preload) {
        this.preloadFn()
      }
    }

    return thenable
      .then((effect: any) => {
        let res = effect
        runInAction(_action, () => {
          // console.log('loadx effect', effect)
          typeof effect === 'function' && (res = effect.apply(this))
          _onComplete && _onComplete(res, ..._args)
          this.finish(thenable)
        })
        return res
      })
      .catch((err: any) => {
        console.error(`loadx catch ${_action}`, err)
        const finalErr = isObject(err) ? err : new Error(err + '')
        runInAction(_action, () => {
          _onError && _onError(finalErr, ..._args)
          _onComplete && _onComplete(finalErr, ..._args)
          this.finish(thenable)
        })
        return Promise.reject(finalErr)
      }) as any
  }

  /**
   * 传 fn
   */
  bind<T extends FnType>(fn: T, context?: any): LoadxLoadFnType<T>
  bind<T extends FnType>(
    fn: T,
    config?: Omit<ActionConfig, 'loadx'>,
    context?: any,
  ): LoadxLoadFnType<T>
  bind<T extends FnType>(fn: T, config = {}, context: any = null): LoadxLoadFnType<T> {
    // 不传 config
    if (!isPlainObject(config)) {
      context = config
      config = {}
    }
    return createLoadxFn(fn, { ...config, loadx: this }, context) as any
  }

  setConfig(config: ActionConfig) {
    if (has(config, 'observe')) {
      this.observe = config.observe as any
    }
    if (has(config, 'preload')) {
      this.preload = config.preload as any
      if (!this.preload) return
      this.startPreload()
    }
  }

  startPreload() {
    // 同步 resolve
    const loadReq: any = new Promise(resolve => {
      setTimeout(resolve, typeof this.preload === 'number' ? this.preload : 3 * 1000)
      this.preloadFn = () => {
        resolve()
        this.preload = false
        this.preloadFn = null
      }
    })
    loadReq._action = 'preloadRequest'
    this.load(loadReq)
  }

  private finish(promise: Promise<any>) {
    this.requests.splice(this.requests.indexOf(promise), 1)
    // console.log('end of loading', promise, this.requests.length)
    if (!this.requests.length) {
      this.observe && this.atom.reportChanged()
      // reset observe
      this.observe = true
    }
  }
}
