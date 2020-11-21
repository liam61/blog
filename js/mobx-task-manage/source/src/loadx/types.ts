export type FnType = (...args: any[]) => any

export type UnFnReturn<T> = T extends (...args: any[]) => infer R ? R : T

// 构造函数的 config
export interface LoadxConfig {
  name?: string
  requests?: Promise<any>[]
  observe?: boolean
  preload?: boolean | number // Loadx new 时就显示 loading，直到第一个请求完成时
}

export type LoadxLoadFnType<T> = T extends (
  ...args: any[]
) => Promise<infer R> | Generator<any, infer R>
  ? (...args: Parameters<T>) => Promise<UnFnReturn<R>>
  : T

export type LoadxLoadType<T> = T extends Promise<infer R> | Generator<any, infer R>
  ? Promise<UnFnReturn<R>>
  : T

export type LoadxStore<T extends Record<string, any>> = {
  [K in keyof T]: LoadxLoadFnType<T[K]>
}
