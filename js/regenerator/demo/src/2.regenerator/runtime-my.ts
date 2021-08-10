import {
  _inheritsLoose,
  GeneratorMethod,
  GeneratorReturnType,
  GenStateCompleted,
  // GenStateExecuting,
  GenStateSuspendedStart,
  GenStateSuspendedYield
} from "../utils";

class GeneratorFunction {}

class GeneratorFunctionPrototype {
  static [Symbol.toStringTag] = "GeneratorFunction";

  // set by wrap fn
  private _invoke: (method: GeneratorMethod, args?: any) => GeneratorReturnType;

  next(args?: any) {
    return this._invoke("next", args);
  }

  return(args?: any) {
    return this._invoke("return", args);
  }

  throw(args?: any) {
    return this._invoke("throw", args);
  }

  [Symbol.iterator]() {
    return this;
  }

  toString() {
    return "[object Generator]";
  }

  get [Symbol.toStringTag]() {
    return "Generator";
  }
}

// 相互引用
GeneratorFunctionPrototype.constructor = GeneratorFunction;
GeneratorFunction.prototype = GeneratorFunctionPrototype;

class Generator {}
// tricks，可用于判断 fn instanceof Generator
Generator.prototype = GeneratorFunctionPrototype.prototype;

function mark(genFn: () => void) {
  return _inheritsLoose(genFn, GeneratorFunctionPrototype);
}

function wrap(serviceFn: (context: Context) => void, _outerFn?: Generator) {
  const generator: any = new Generator();
  const context = new Context();

  let state = GenStateSuspendedStart;
  // 实现 _invoke
  generator._invoke = function invoke(method: GeneratorMethod, args?: any) {
    context.method = method;
    context.args = args;

    if (method === "next") {
      // 记录上下文参数
      context.sent = args;
    } else if (method === "throw") {
      if (state === GenStateSuspendedStart) {
        state = GenStateCompleted;
        throw args;
      }
    } else {
      context.abrupt("return", args);
    }

    try {
      // 执行业务上的代码
      const value = serviceFn(context);
      state = context.done ? GenStateCompleted : GenStateSuspendedYield;

      return {
        value,
        done: context.done
      };
    } catch (err) {
      state = GenStateCompleted;
      context.method = "throw";
      context.args = err;
    }
  };

  return generator;
}

class Context {
  // prev: number | string
  next: number | string = 0;
  sent: any = undefined;
  method: GeneratorMethod = "next";
  args: any = undefined;
  done: boolean = false;
  value: any = undefined;

  stop() {
    this.done = true;
    return this.value;
  }

  abrupt(type: "return" | "throw", args?: any) {
    if (type === "return") {
      this.value = args;
      this.method = "return";
      this.next = "end";
    } else if (type === "throw") {
      throw args;
    }
  }
}

function isGeneratorFunction(genFn: any) {
  if (typeof genFn !== "function") return false;
  return genFn.constructor === GeneratorFunction;
}

export default {
  mark,
  wrap,
  isGeneratorFunction
};

// @ts-ignore
window.Generator = Generator;
