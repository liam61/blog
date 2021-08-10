export function isPromise(obj: any) {
  return typeof obj.then === "function";
}

export function isGenerator(obj: any) {
  return typeof obj.next === "function" && typeof obj.throw === "function";
}

// https://github.com/tj/co/blob/master/index.js#L222
export function isGeneratorFunction(obj: any) {
  const { constructor } = obj;
  if (!constructor) return false;
  if ([constructor.name, constructor.displayName].includes("GeneratorFunction"))
    return true;
  return isGenerator(constructor.prototype);
}

export function wait(num: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(num), 600));
}

export function _inheritsLoose(subClass: any, superClass: any) {
  Object.setPrototypeOf(subClass, superClass);
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  return subClass;
}

export const GenStateSuspendedStart = "suspendedStart";
export const GenStateSuspendedYield = "suspendedYield";
// export const GenStateExecuting = "executing";
export const GenStateCompleted = "completed";

export type GeneratorMethod = "next" | "return" | "throw";

export type GeneratorReturnType = { value: any; done: boolean };
