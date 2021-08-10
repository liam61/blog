# Generator 协程工作原理

搜了一圈，关于 `Generator` 基本都是在讲用法，但很少提及到其工作原理，也就是“协程”。但又因为这东西我们直接或间接的每天都在使用，于是准备专门写一篇文章来讲讲这个

## JS 回调史

### 一、`Callback`

1. ES5 及更早时期，写回调基本都是 callback，回调地狱就不说了，离它远点

### 二、Promise

1. Promise 通过链式调用，优化了回调的书写方式，本质上也是回调。由其封装出来的 `Deferred` 也在各大开源库能看到踪影，如 [qiankun](https://github.com/umijs/qiankun/blob/master/src/utils.ts#L82)

2. Promise 本身没有什么新颖的东西，但由 then 注册的回调要在当前事件循环的**微任务阶段**去执行这一点，意味着 Promise 只能由原生层面提供。用户层面的 polyfill 只能用宏任务完成，如 [promise-polyfill](https://github.com/taylorhakes/promise-polyfill/blob/master/src/index.js#L248)

### 三、Generator

1. Generator 是本文的主角，ES6 重磅推出的特性，可以理解成一个状态机，里面包含了各种状态，使用 yield 来触发下一步

2. Generator 引入的“协程”概念，是传统回调无法比拟的，这就意味着我们可以以同步的方式来书写异步代码，再配上自动执行，如 [tj 大神的 co 库](https://github.com/tj/co) ，简直美翻

3. generator 对象同时实现了：

- 可迭代协议（Symbol.iterator）：可通过 for...of 进行迭代，如内置对象 Array、String，它们都实现了这个协议

- 迭代器协议（next()）：可调用其 next 方法获取 `{ value: any, done: boolean }` 来判断状态

### 四、async、await

1. Generator、yield 的语法糖，精选了一些特性。反过来说就是舍掉了些功能（后文会讲）

2. 用 babel 编译一段含 async、await 和 yield 的代码，可知前者多了两个函数 `asyncGeneratorStep` 和 `_asyncToGenerator`，其实它就是自动执行功能

3. 原理很简单：

- 获取 Generator 对象，借助 Promise 的微任务能力执行 next

- ret.value 返回的值就是 await 的值，封装成 Promise 当做下次入参

- 判断每次递归结果，直到返回 done 为 true

```js
async function a() {}

function* b() {}

// babel 编译后
function asyncGeneratorStep(gen, resolve, reject, _next, ...) {
  // 调用 gen 的 next 或 throw 方法
  var info = gen[key](arg);
  var value = info.value;

  if (info.done) {
    resolve(value);
  } else {
    // 递归执行
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    return new Promise(function (resolve, reject) {
      // 获取 generator 对象
      var gen = fn.apply(self, arguments);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      // 初始化执行 next
      _next(undefined);
    });
  };
}
```

## generator Object、Generator、 GeneratorFunction

### 一、generator Object

1. 由 Generator 执行后返回，带有 next、return、throw 等原型方法，就是我们常操作的小伙伴

```js
function* gen() {}
const gObj = gen();

gObj.next();
gObj.return();
```

### 二、Generator

1. 可通过 `function*` 语法来定义，它是 GeneratorFunction 的实例

```js
Object.getPrototypeOf(gen).constructor // GeneratorFunction {prototype: Generator, ...}
```

2. Generator 函数本身在用户代码层面，意义不大，基本不会用到

### 三、GeneratorFunction

1. 它是内置函数，但没有直接挂到 window 上，但我们可以通过它的实例来获取

```js
const GeneratorFunction = Object.getPrototypeOf(gen).constructor;
```

2. GeneratorFunction 和 `Function` 是一个级别的，可以传参来创建函数，如

```js
const gen = new GeneratorFunction('a', 'yield a * 2');
const gObj = gen(10);
gObj.next().value // 20
```

## Generator 的工作原理

正片开始，代码示例：

```js

let num = 0;
async function gen() {
  num = num + (await wait(10));
  await 123;
  await foo();
  return num;
}

function wait(num: number) {
  return new Promise((resolve) => setTimeout(() => resolve(num), 600));
}

async function foo() {
  await "literal";
}

await gen();
console.log("regenerator: res", num);
```

### 一、核心点

1. Generator 的状态是如何实现的，或者说 Generator 是如何执行到 yield 就停止的

2. 多个 Generator 是如何协作的，即如何让权给另一个 Generator，之后又让权回来的

3. 一个 Generator 是如何监听另一个 Generator 的执行过程，即 [yield* genFn()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield*)


### 二、Generator、GeneratorFunction 及其 prototype 的关系

如果你对原型链和继承有所遗忘的话，建议先看下这篇 [prototype&extends](https://github.com/lawler61/blog/blob/master/js/prototype&extends/index.md)

```js
class GeneratorFunction {}

// GeneratorFunction 的 prototype 很通用，单独拎出来
class GeneratorFunctionPrototype {
  static [Symbol.toStringTag] = "GeneratorFunction";

  // 实现 iterator protocol
  next(args) {}

  return(args) {}

  throw(args) {}

  // 实现 iterable protocol
  [Symbol.iterator]() {
    return this;
  }
}

// 相互引用
GeneratorFunctionPrototype.constructor = GeneratorFunction;
GeneratorFunction.prototype = GeneratorFunctionPrototype;

// 作用不大，设置 prototype 即可
class Generator {}
Generator.prototype = GeneratorFunctionPrototype.prototype;
```

### 二、Generator 的状态

1. 状态机实现不难，通过一个 flag 记录状态，每次状态运行后记录下次的状态，**一定时机**后再进入执行

2. 状态机是由用户层面代码生成，里面使用 `switch case + context 记录参数` 实现

```js
function _callee$(_context) {
  while (1) {
    switch (_context.next) {
      case 0:
        // await wait(10)
        _context.next = 3;
        return wait(10);
      case 3:
        // await 123
        _context.next = 7;
        return 123;
      case 7:
        _context.next = 9;
        // await foo()
        return foo();
      case "end":
        return _context.stop();
    }
  }
}
```

3. 可知每次 yield 对应着一个 switch case，每次都会 return，自然每次 yield 完后就“卡住了”

### 三、多个 Generator 协作

1. 由 case return 可知 Generator 让权，就是主动执行别的 Generator，并退出自己的状态

2. 同理 foo Generator 也是 switch case 这种结构，那它执行完是如何让权回到并触发父级状态机继续执行呢

3. 我们来看 babel 是如何编译 async 函数的。先抛开 mark 和 warp 函数，`_asyncToGenerator` 我们之前说了，就是自动执行，这其实和 `co(markFn)` 无异。另一方面你可以推断出 `regeneratorRuntime.mark` 函数返回的其实就是 polyfill 的 Generator

```js
function _foo() {
  _foo = _asyncToGenerator(
    regeneratorRuntime.mark(function _callee2() {
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        switch (_context2.next) {
          case 0:
            _context2.next = 2;
            return "literal";
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    })
  );
  return _foo.apply(this, arguments);
}
```

4. 所以 foo 执行 switch 完，经过处理后把 `{ value: "literal", done: true }` 作为了 mark 函数的返回值，并交给 _asyncToGenerator 使用，它如何使用的呢，当然是 `promise.then(next)`

5. 那协作呢？你别只局限于 foo 函数，父级 gen 函数不也是这样！gen 函数这时在干啥，当然是等待 foo resolve，然后 gen 返回 `{ value: fooRetValue, done: false }`，继续 next

6. 整理下：

- ① 父级 gen 函数执行到一个 case，将子 foo 函数的返回值作为本次结果，然后将自己卡住（其实就是在 co 层面等待子 promise resolve）

- ② foo 执行完后返回 done true，并结束自己的状态生涯，再将自己 co 层面的 Promise resolve

- ③ gen 卡住的 Promise 收到了 foo 的结果，本次返回 done false，开启下一轮 next，并重新通过 context.next 进入到对应 case 中

7. 所以你可以看出，Generator 离开了 Promise 时成不了大器的，无论是原生实现还是 polyfill，主要原因还是之前说的，我们没法在 js 层面干涉到 v8 的事件循环

### 四、mark、wrap、Context

1. 你应该知道 mark 函数了：接收一个函数并把它改造成 Generator。怎么做呢，继承啊

```js
function mark(genFn: () => void) {
  return _inheritsLoose(genFn, GeneratorFunctionPrototype);
}

function _inheritsLoose(subClass, superClass) {
  Object.setPrototypeOf(subClass, superClass);
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  return subClass;
}
```

2. 每个 wrap 会创建一个 context 来管理状态以及上下文参数，每次执行 case 时会先打个**快照**，防止 yield 完后参数更改

3. mark 函数的 next、return、throw 最终调用是 wrap 的能力，因为实际是 wrap 在协调用户代码（switch case）和 context 来决定接下来的走向，所以要完善下 GeneratorFunctionPrototype，让其和 wrap 连接起来，自己只负责传递 type 和 args

```ts
type GeneratorMethod = "next" | "return" | "throw";

class GeneratorFunctionPrototype {
  // set by wrap fn
  private _invoke: (method: GeneratorMethod, args) => { value: any, done: boolean };

  // 注意这是原型方法哦
  next(args) {
    return this._invoke("next", args);
  }

  return(args) {
    return this._invoke("return", args);
  }

  throw(args) {
    return this._invoke("throw", args);
  }
}
```

4. wrap 实现

```ts
function wrap(serviceFn) {
  // 依然借用 GeneratorFunctionPrototype 的能力
  const generator = new Generator();
  const context = new Context();

  let state = GenStateSuspendedStart;
  // 实现 _invoke
  generator._invoke = function invoke(method: GeneratorMethod, args) {
    context.method = method;
    context.args = args;

    if (method === "next") {
      // 记录上下文参数
      context.sent = args;
    } else if (method === "throw") {
      throw args
    } else {
      context.abrupt("return", args);
    }

    // 执行业务上的代码
    const value = serviceFn(context);
    state = context.done ? GenStateCompleted : GenStateSuspendedYield;

    return {
      value,
      done: context.done
    };
  };

  return generator;
}
```

5. Context 记录当前运行状态和上下文参数等，并提供结束、报错、代理等方法

```js
class Context {
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

  abrupt(type: "return" | "throw", args) {
    if (type === "return") {
      this.value = args;
      this.method = "return";
      this.next = "end";
    } else if (type === "throw") {
      throw args;
    }
  }
}
```

### 五、yield* genFn()

最后一点，可能各位用得少，但缺了的话，Generator 是不完整的

1. 之前挖了个坑，await、async 舍弃了的功能就是：一个 Generator 是监听到另一个 Generator 的执行过程。事实上使用 await 我们并不能知道子函数经历了多少个 await

```js
async function a() {
  const res = await b();
}

async function b() {
  await 1;
  await 'str';
  return { data: 'lawler', msg: 'ok' };
}
```

2. 那在 yield 层面，这个功能是如何实现的呢。实际上 yield* 是通过 delegateYield 方法接替了 foo，在 context 内部循环运行，使得这次 yield 在一个 case 中完成

```js
function gen$(_context) {
  switch (_context.next) {
    case 0:
      _context.next = 7;
      return wait(10);
    case 7:
      // 传递 foo generator object 给 gen 的 context
      return _context.delegateYield(foo(), "t2", 8);
    case "end":
      return _context.stop();
  }
}
```

3. wrap 里面，循环执行

```js
generator._invoke = function invoke(method, args) {
  context.method = method;

  // yield* genFn 时使用，循环返回 genFn 迭代的结果，直到 return
  while (true) {
    const delegate = context.delegate;
    if (delegate) {
      const delegateResult = maybeInvokeDelegate(delegate, context);
      if (delegateResult) {
        if (delegateResult === empty) continue;
        // 传出内部迭代结果 { value, done }
        return delegateResult;
      }
    }
  }

  if (method === "next") {}
}
```

## 最后

1. 本文只是简单对 Generator 进行了实现，实际上 `regenerator` 做的事情还很多，如 throw error、yield* gen() 时各种状况的处理以及其他方便的 api，喜欢的自行 dive in 吧

2. 通过本文对 Generator 工作原理的讲解，让我们对“协程”这个概念更加深刻的认识，这对于我们每天都要用的东西、调试的代码都有“磨刀不误砍柴工”的功效

4. 源码获取：[regenerator](https://github.com/lawler61/blog/tree/master/js/regenerator/demo)

6. 码字不易，喜欢的小伙伴，记得留下你的小 ❤️ 哦~

## 参考资料

- [MDN Generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator)

- [MDN Iteration protocols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#the_iterable_protocol)

- [regenerator](https://github.com/facebook/regenerator)

- [co](https://github.com/tj/co)
