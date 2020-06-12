import { isGeneratorFunction, isGenerator, isPromise } from '.'
import { cache } from './cache'

export const THEN_SYNC = '_thenSync_'

export const THEN_ALL = '_thenAll_'

interface Thenable<R> {
  then<U>(
    onFulfilled?: (value: R) => U | Thenable<U>,
    onRejected?: (error: any) => any,
  ): Thenable<U>
}

type Coable<T, R, A extends any[]> =
  | Generator<T, R, any>
  | ((...args: A) => Generator<T, R, any>)
  | ((...args: A) => Promise<any>)

/**
 * a sync Promise
 */
export class ThenSync<R> implements Thenable<R> {
  private data: any = null
  status: 'pending' | 'resolved' | 'rejected' = 'pending'

  constructor(
    executor: (resolve: (value?: R | Thenable<R>) => void, reject: (error?: any) => void) => void,
  ) {
    const resolve = (value?: R | Thenable<R>) => {
      if (value instanceof ThenSync) return value.then(resolve, reject)
      if (this.status === 'pending') {
        this.status = 'resolved'
        this.data = value
      }
    }
    const reject = (err?: any) => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.data = err
      }
    }

    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then<U>(
    onFulfilled?: (value: R) => U | Thenable<U>,
    onRejected?: (error: any) => any,
  ): ThenSync<U> {
    typeof onFulfilled !== 'function' && (onFulfilled = (v => v) as any)
    typeof onRejected !== 'function' &&
      (onRejected = err => {
        throw err
      })

    const that = this
    let t2: any = null
    let x: any

    if (that.status === 'resolved') {
      t2 = new ThenSync((resolve, reject) => {
        try {
          x = onFulfilled!(that.data)
          resolvePromise(t2, x, resolve, reject)
        } catch (err) {
          reject(err)
        }
      })
    } else {
      // rejected
      t2 = new ThenSync((resolve, reject) => {
        try {
          x = onRejected!(that.data)
          resolvePromise(t2, x, resolve, reject)
        } catch (err) {
          reject(err)
        }
      })
    }

    // new thenable
    return t2
  }

  static resolve<R>(value: R | Thenable<R>): ThenSync<R> {
    return new ThenSync(resolve => resolve(value))
  }

  static reject<R>(err: any): ThenSync<R> {
    return new ThenSync((_resolve, reject) => reject(err))
  }

  catch<U>(onRejected?: (error: any) => U | Thenable<U>): ThenSync<U> {
    return this.then(null as any, onRejected)
  }
}

function resolvePromise(t2: Thenable<any>, x: any, resolve, reject) {
  let called = false

  if (x instanceof ThenSync) {
    if (x.status === 'pending') {
      x.then(v => resolvePromise(t2, v, resolve, reject), reject)
    } else {
      x.then(resolve, reject)
    }
    return
  }
  if (x !== null && ['object', 'function'].includes(typeof x)) {
    try {
      const then = x.then // x.then could be a getter
      if (typeof then === 'function') {
        then.call(
          x,
          v => {
            if (called) return
            called = true
            return resolvePromise(t2, v, resolve, reject)
          },
          e => {
            if (called) return
            called = true
            return reject(e)
          },
        )
      } else {
        resolve(x)
      }
    } catch (err) {
      if (called) return
      called = true
      return reject(err)
    }
    return
  }
  resolve(x)
}

export function syncPromise<T>(promise: Promise<T>) {
  const p: any = promise.then(res => {
    // 如果正式使用时接口还没回来，则直接返回
    if (p[THEN_SYNC] === false) return res
    console.log('syncify promise!!', p)
    syncify(p, res)
    return res
  })
  return p as Promise<T>
}

function syncify<R>(obj: any, res: R) {
  if (!isPromise(obj)) return obj
  const hack = ThenSync.resolve(res)
  // 由于 p 已经作为 Promise 返回了，所以通过 p 调的 then 要改为 thenSync.then
  obj.then = hack.then.bind(hack)
  obj.catch = hack.catch.bind(hack)
  obj[THEN_SYNC] = hack
  return obj
}

/**
 * inspired by https://github.com/tj/co
 * can autorun sync generator, also work for preload
 */
export function co<T, R, A extends any[]>(
  this: any,
  thing: Coable<T, R, A>,
  ...args: A
): Promise<R> {
  const that = this
  let isAsync = true
  let finalRes
  const p: any = new Promise((resolve, reject) => {
    let gen: Generator = thing as any
    if (typeof thing === 'function') gen = (thing as any).apply(that, args)
    // not a generator
    if (!gen || typeof gen.next !== 'function') return resolve(gen)

    onFulfilled()

    function onFulfilled(res: any = undefined) {
      let ret
      try {
        ret = gen.next(res)
      } catch (err) {
        return reject(err)
      }
      next(ret)
      return null
    }

    function onRejected(err: any) {
      let ret
      try {
        ret = gen.throw(err)
      } catch (e) {
        return reject(e)
      }
      next(ret)
    }

    function next(ret) {
      const { value, done } = ret
      console.log('value', ret)
      if (done) {
        finalRes = value
        return resolve(value)
      }
      const finalValue = toPromiseWithPreload.call(that, value)

      if (isPromise(finalValue)) {
        finalValue[THEN_SYNC] && (isAsync = false)
        return finalValue.then(onFulfilled, onRejected)
      }
      return onRejected(
        new TypeError('You may only yield a promise, arr, generator or generator function!'),
      )
    }
  })
  return isAsync ? p : syncify(p, finalRes)
}

function toPromiseWithPreload(this: any, thing: any) {
  if (!thing) return thing
  // yield Thenable
  if (isPromise(thing)) return thing
  // yield *function() {}
  if (isGeneratorFunction(thing) || isGenerator(thing)) return co.call(this, thing)
  // yield [Thenable, Thenable]
  if (Array.isArray(thing)) {
    // 查看任意一个 api 是否含有 all 的 key
    const key = thing[0][THEN_ALL]
    // 未缓存时直接返回
    if (!key) return Promise.all(thing)
    const allApi = cache[key]
    if (!allApi[THEN_SYNC]) {
      allApi[THEN_SYNC] = false
    }
    delete cache[key]
    return allApi
  }
  return thing
}
