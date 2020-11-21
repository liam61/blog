export function getUid() {
  return Math.random().toString(36).slice(-8)
}

export function wait<T>(delay = 200, data?: T): Promise<T> {
  return new Promise((resolve, reject) =>
    setTimeout(() => {
      if (!(data instanceof Error)) return resolve(data)
      return reject(data)
    }, delay),
  )
}

export function addHiddenProp(obj: any, propName: PropertyKey, value: any) {
  Object.defineProperty(obj, propName, {
    writable: true,
    configurable: true,
    value,
  })
}

function quacksLikeADecorator(args: any[]): boolean {
  // 类：1；属性：2；方法：3；方法参数：3
  return (
    ((args.length === 2 || args.length === 3) && typeof args[1] === 'string') ||
    (args.length === 4 && args[3] === true)
  )
}

export type PropertyCreator = (
  instance: Record<string, any>,
  propertyName: PropertyKey,
  descriptor: PropertyDescriptor,
  decoratorArgs: any[],
) => any

export function createPropDecorator(propertyCreator: PropertyCreator) {
  return function decoratorFactory(...args: any[]) {
    let decoratorArguments: any[]

    function decorator(target: any, prop: string, descriptor: PropertyDescriptor) {
      return propertyCreator(target, prop, descriptor, decoratorArguments)
    }

    // @decorator
    if (quacksLikeADecorator(args)) {
      decoratorArguments = []
      return decorator.apply(null, args as any)
    }
    // @decorator(args)
    decoratorArguments = args
    return decorator
  }
}
