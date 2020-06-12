export const timer: any = {}

export function wait<T>(mock?: T): Promise<T> {
  const delay = 300 + Math.random() * 50
  return new Promise(resolve => setTimeout(() => resolve(mock), delay))
}

export function getUid() {
  return Math.random()
    .toString(36)
    .slice(-8)
}

export function getBool() {
  return Math.random() > 0.5
}

export function isPromise(obj: any) {
  return obj && ['function', 'object'].includes(typeof obj) && typeof obj.then === 'function'
}

export function isGeneratorFunction(obj: any) {
  if (!obj) return false
  const { constructor } = obj
  if (!constructor) return false
  if ([constructor.name, constructor.displayName].includes('GeneratorFunction')) return true
  return isGenerator(constructor.prototype)
}

export function isGenerator(obj: any) {
  return obj && typeof obj.next === 'function' && typeof obj.throw === 'function'
}
