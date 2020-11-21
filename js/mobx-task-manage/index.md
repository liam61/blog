# 还在 try catch + runInAction？试试这款效率工具

前段时间撸了个效率工具，基本能够应对业务上相对复杂的场景，目前相关业务代码已上线几个月，运行良好

## 介绍

### 一、背景

1. 业务比较复杂且上下牵扯较多时，通常接口函数到处调用，一会这需要 loading，那需要 await 的，想着就麻烦

2. 而且 mobx 对于异步后（await）的 action 如无法感知，必须手动包上 runInAction，让我吐一口血

3. 再者一个 api 通常要用 try catch finally 走一遍，书写麻烦，用不好还有可能引起多次 rerender

4. 传统书写方式要管理的东西太多，不能很好的专注于业务，容错代码一大堆

没法办，程序员就是懒……所以有个这款 `Loadx` 效率工具


### 二、功能点

1. 方便对 api 的组织和管理

2. 方便 error 容错、finally 和后续 action 操作等的书写，专注于业务

3. 并发和串行请求智能 loading，统一 rerender

4. 方便对是否 loading，预 loading 的初始化配置，以及动态配置

5. 支持 Class Component 和 hooks

6. 方便的 type 提示和各种书写容错

## 原理

### 一、`mobx.createAtom`

1. 其实最核心的是利用了 mobx 提供的 api [createAtom](https://cn.mobx.js.org/refguide/extending.html)

2. 看过我之前的 [mobx 源码解读系列](https://github.com/lawler61/blog/blob/master/js/mobx-source/index.md) 文章，应该对这个 api 或者 `Atom` 类有印象，这就 `mobx` 的订阅-发布的原子，所有的 observableValue 等都是基于这个做的

3. 其中两个核心方法：`reportObserved` 和 `reportChanged`

- `reportObserved`：访问“自己”时向订阅者报告

- `reportChanged`：改变“自己”时像订阅者报告

4. 如果我们自己实现一套订阅-发布中的“发布机制”的话（订阅机制当然是 [mobx 劫持 render 触发 forceupdate](https://github.com/lawler61/blog/blob/master/js/mobx-source/5.mobx-react.md)）啦，这就是控制 loading 与否的关键

### 二、request stack

1. 维护一个 requests 的队列，当有接口来时入栈，请求完出栈，查看 request 的数量就知道当前是否该处于 loading 状态

2. 与 `atom` 结合的话，嘿嘿

- request length 0 -> 1：开始 loading，调用 `atom.reportChanged`

- reqeust length 1 -> 0：结束 loading，也调用 `atom.reportChanged`

3. 注意 length 1 -> n 或 n -> 1 时，都不调用，因为还在 loading 嘛，这就做到了批量处理 loading，一次性 rerender

4. 获取 loading 状态时：调用 `atom.reportObserved`

### 三、后续 action 的处理

1. 太麻烦了，帮我把 try catch 和 runInAction 封装了吧。好的！

2. 但毕竟要在 action 中执行，那就**返回个函数**吧

## 还等什么，开撸

### 一、`Loadx`

1. 架子

```js
export interface LoadxConfig {
  name?: string;
  requests?: Promise<any>[];
}

export class Loadx {
  name: string;
  private atom: IAtom;
  requests: Promise[] = [];

  constructor(config?: LoadxConfig) {
    const {
      name = 'loadx',
      requests,
    } = config || {};
    this.name = name;
    this.atom = createAtom(name);
    // new 时预填充 request
    requests && requests.forEach((p) => this.load(p));
  }

  get loading() {
    // 获取状态时，往上报告
    this.atom.reportObserved();
    return !!this.requests.length;
  }

  // 单个 request 入栈
  load(request: Promise) {
    const { length: preLen } = this.requests;
    const thenable = Promise.resolve(request);
    this.requests.push(thenable);

    // 0 -> 1
    if (!preLen) {
      this.atom.reportChanged();
    }

    return thenable
      .then(effect => {
        let res = effect;
        runInAction(() => {
          // 处理业务上返回的 action 函数
          typeof effect === "function" && (res = effect.apply(this));
          // 出栈
          this.finish(thenable);
        });
        return res;
      })
      .catch(err => {
        runInAction(() => {
          this.finish(thenable);
        });
        return Promise.reject(finalErr);
      });
  }

  private finish(promise: Promise) {
    this.requests.splice(this.requests.indexOf(promise), 1);
    // 1 -> 0
    if (!this.requests.length) {
      this.atom.reportChanged();
    }
  }
}
```

2. 使用

```js
class Store {
  private loadx = new Loadx();

  count = 0;

  // 为避免外部直接调用 loadx，以及在 react render 层面注册对该 atom 的依赖
  @computed
  get loading() {
    return this.loadx.loading;
  }

  _getCount() {
    const count = await api();

    // 返回 action fn
    return () => {
      this.count = count;
    }
  }

  getCount() {
    // 关联
    return this.loadx.load(action(this._getCount));
  }
}

const store = new Store();
autorun(r => {
  console.log(store.loading, store.count);
});

store.getCount();
```

### 二、装饰器是真谛

凭啥我还要主动去调用 loadx.load 关联下。是的，封装了！像 @action 一样调用不香么

1. 我们使用 [mobx 的造神装饰器：createDecoratorForEnhancer](https://github.com/lawler61/blog/blob/master/js/mobx-source/1.observable-an-object.md#%E4%BA%8Cdecorator-%E9%80%A0%E7%A5%9E%E5%B7%A5%E5%85%B7)，不清楚的小伙伴可以看我之前文章，上面还有简化版的小例子

```js
class Loadx {
  /**
   * 像 mobx.action 一样支持两种装饰写法
   * @action(ActionConfig) fn
   * @action fn
   */
  static action = createPropDecorator(function (target, prop, descriptor, args) {
    // @action fn() {}
    // 注意这种写法在解构调用时会出现 this bind 问题哦，相信大家遇到过，一起封装了
    if (descriptor) {
      return {
        configurable: true,
        enumerable: false,
        get() {
          const fn = descriptor.value || (descriptor as any).initializer.call(this);
          // 即 Object.defineProperty
          addHiddenProp(this, prop, createLoadxFn(fn, args[0], this));
          return this[prop];
        },
        set() {}
      };
    } else {
      // @action fn = () => {}
      Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: false,
        get() {},
        set(fn) {
          addHiddenProp(this, prop, createLoadxFn(fn, args[0], this));
        }
      });
    }
  });
}
```

2. 然后看下装饰器调用的核心：`createLoadxFn`

```js
export interface ActionConfig {
  loadx?: string | Loadx; // 关联的 store Loadx
  action?: string; // 自定义 return action name
}

export function createLoadxFn(fn, config: ActionConfig = {}, context: any = null) {
  const id = getUid();
  return function (this: any, ...args: any[]) {
    const that = context || this;
    const { loadx: lName = "", action } = config;
    // 根据 name 从 store 实例中找 loadx 实例
    const loadx:Loadx = that[lName];
    // 在 action 中执行 store 的方法，返回 Promise
    const req = runInAction(action, () => fn.apply(that, args));

    return loadx.load(req);
  };
}
```

3. 使用

```js
class Store {
  private loadx = new Loadx();

  @Loadx.action
  getUser() {
    // 批量处理：会等 Promise.all 以及后续 effect action 后放开 loading
    await getPermission();
    const [name, age] = await Promise.all([nameApi(), ageApi()]);

    // 返回 action fn
    return () => {
      if (this.perm) {
        this.name = name;
        this.age = age;
      }
    }
  }

  @Loadx.action({
    // 不传也行，默认容错
    // name: 'loadx'
  })
  getPermission = () => {
    const perm = await permApi();

    return () => {
      this.perm = perm;
    }
  }
}

new Store().getUser();
```

4. 美化 `bind`

当然如果是动态方法啥的，没法用装饰器，只能手动 bind，那么我们美化下吧

```js
class Loadx {
  bind<T extends FnType>(fn: T, context?: any);
  bind<T extends FnType>(fn: T, config = {}, context: any = null
) {
  // 不传 config
  if (!isPlainObject(config)) {
    context = config;
    config = {};
  }
  return createLoadxFn(fn, { ...config, loadx: this }, context);
}

// 使用
class Store {
  getCount = this.loadx.bind(this._getCount, this);

  _getCount() {
    const count = await api();

    return () => {
      this.count = count;
    }
  }
}

const store = new Store();
store.getGender = store.loadx.bind(getGenderFromOtherPlace, store);
```

### 三、完善周边

1. `try catch finally`

- 由于 catch 都被拆带外面去了，所以不能在写在 action fn 中

- 这也是我们想要的嘛，简洁书写，让我们更关注业务本身，而不是必须把健壮性给塞进去。所以，封装了吧！

```js
export interface ActionConfig {
  loadx?: string | Loadx; // 关联 Loadx
  action?: string; // action name
  // 通过配置传进来
  onError?: (err: any, ...originalArgs: any[]) => void | Promise<void>; // error 回调
  onComplete?: (resOrErr?: any, ...originalArgs: any[]) => void | Promise<void>; // complete 回调
}

export function createLoadxFn(fn config: ActionConfig = {}, context: any = null) {
  return function (this: any, ...args: any[]) {
    const that = context || this;
    const {
      loadx: lName = "",
      action,
      onComplete,
      onError
    } = config;
    // ...

    // 从装饰器中获取参数，并挂到 req 上
    onError && (req._onError = onError.bind(that));
    onComplete && (req._onComplete = onComplete.bind(that));

    return loadx.load(req);
  };
}

class Loadx {
  load<T>(request: T): LoadxLoadType<T> {
    // 获取 config
    const { _onError, _onComplete } = request;
    const { length: preLen } = this.requests;

    // ...

    return thenable
      .then(effect => {
        let res = effect;
        runInAction(() => {
          typeof effect === "function" && (res = effect.apply(this));
          _onComplete && _onComplete(res, ..._args);
          this.finish(thenable);
        });
        return res;
      })
      .catch(err => {
        const finalErr = err;
        runInAction(() => {
          _onError && _onError(finalErr, ..._args);
          _onComplete && _onComplete(finalErr, ..._args);
          this.finish(thenable);
        });
        return Promise.reject(finalErr);
      });
  }
}

// 使用
class Store {
  @Loadx.action({
    onError(this: Store, err) {
      console.log("onError", this, err);
    },
    onComplete(_resOrErr) {}
  })
  getUser() {
    // ...
  }
}
```

2. 控制 `loading`

- 有时我想提前开启 loading 为 true 的状态，比如进入 page 的初始化 loading

- 或者我在某些情况下，我不想去监听 loading，而且还是动态设置呢

```js
export interface ActionConfig {
  loadx?: string | Loadx;
  action?: string;
  // 继续配置参数
  observe?: boolean; // 设置是否监听 loading 变化，默认为 true
  preload?: boolean | number;
  onError?: (err: any, ...originalArgs: any[]) => void | Promise<void>;
  onComplete?: (resOrErr?: any, ...originalArgs: any[]) => void | Promise<void>;
}

class Loadx {
    setConfig(config: ActionConfig) {
    // 根据传的参来改变
    if (has(config, "observe")) {
      this.observe = config.observe;
    }
    if (has(config, "preload")) {
      this.preload = config.preload;
      if (!this.preload) return;
      this.startPreload();
    }
  }
 
  private startPreload() {
    // 使用 setTimeout 模拟预发起了一个请求
    const loadReq = new Promise((resolve) => {
      setTimeout(resolve, this.preload);
      this.preloadFn = () => {
        resolve();
        this.preload = false;
        this.preloadFn = null;
      };
    });
    this.load(loadReq);
  }

  private finish(promise: Promise) {
    this.requests.splice(this.requests.indexOf(promise), 1);
    if (!this.requests.length) {
      // 监听时才上报
      this.observe && this.atom.reportChanged();
    }
  }
}

// 使用
class Store {
  @Loadx.action
  getUser() {
    this.loadx.setConfig({ observe: false });
    const count = await api();

    return () => {
      this.count = count;
    }
  }
}
```

3. 智能的 type 提示，写法兼容

- 现在 store 方法都以返回的函数形式，组件里使用起来比较迷惑，会看到：`Promise<() => void>`

- 又有些人比较倔强，就不想返回 action fn，非要自己写 runInAction

- 再者，有人又想以 return actionFn 形式，还想返回 await api 之后的数据。安排！

```js
class Store {
  @Loadx.action
  getUser() {
    const perm = await getPermission();
    const [name, age] = await Promise.all([nameApi(), ageApi()]);

    // 返回 action fn
    return () => {
      if (this.perm) {
        this.name = name;
        this.age = age;
      }
    }
  }

  @Loadx.action
  getPermission = (flag = 1) => {
    const perm: boolean = await permApi(flag);

    // 1：纯 api
    // return perm;

    // 2：为啥你如此倔强
    // runInAction(() => {
    //   this.perm = perm;
    // })

    // 3
    return () => {
      this.perm = perm;
      return perm;
    }
  }
}

class Loadx {
  load<T>(request: T): LoadxLoadType<T> {
    // ...

    return thenable
      .then(effect => {
        let res = effect;
        runInAction(() => {
          // 不是函数直接放回，是函数将函数的执行结果返回
          typeof effect === "function" && (res = effect.apply(this));
          _onComplete && _onComplete(res, ..._args);
          this.finish(thenable);
        });
        return res;
      })
      .catch(err => {
        // ...
      });
  }
}
```

最后再操作一波 types。至于具体的 types，不是本文重点，我会单独抽到 types 技巧汇总里面的文章，敬请期待

```js
export type UnFnReturn<T> = T extends (...args: any[]) => infer R ? R : T;

export type LoadxLoadFnType<T> = T extends (...args: any[]) => Promise<infer R> | Generator<any, infer R>
  ? (...args: Parameters<T>) => Promise<UnFnReturn<R>>
  : T;

// 再针对 store 中返回是 Promise<fn> 的方法，限制一下
export type LoadxStore<T extends Record<string, any>> = {
  [K in keyof T]: LoadxLoadFnType<T[K]>;
};

// 使用
@observer
class CC extends Component<{store: LoadxStore<Store>}> {
  render() {
    const { getPermission } = this.props.store;
    // type:
    // const getPermission: (flag: string) => Promise<boolean>

    return <div></div>
  }
}
```

### 四、hooks

都完善差不多了，该 hooks 出场了，其实就是 useLocalStore，只是暴露了 api 而已

```js
export function useLoadx(
  initializer: (source: P & { loadx: Loadx }) => T,
  loadxConfig?: ActionConfig,
  current?: P
): LoadxLocaleStore<T> {
  // create loadx for store
  const loadx = useMemo(() => new Loadx(loadxConfig), []);
  current && (current.loadx = loadx);
  const store = useLocalStore(initializer, current);

  return {
    store,
    loading: loadx.loading,
    bind: (fn: T, config = {}, context: any = null) => {
      // 不传 config
      if (!isPlainObject(config)) {
        context = config;
        config = {};
      }
      return createLoadxFn(
        fn,
        { ...config, loadx },
        context || store
      );
    },
    setConfig: (config) => loadx.setConfig(config)
  };
}

// 使用
const Fc = () => {
  const { store, loading, bind } = useLoadx(() => ({
    data: { name: "empty" }
  }));

  const getDataWithLoading = bind(async () => {
    const res = await wait(1000, { name: 'lawler', age: 20 });
    return () => {
      store.data = res;
    };
  });

  const { data } = store;
  return useObserver(() => (
    <div>
      <div>
        {`loading: ${loading}, data: ${data.name}`}
      </div>
      <button onClick={getDataWithLoading}>FC loadx</button>
    </div>
  ));
};

export default observer(Fc);
```

## 最后

1. 源码获取：[Loadx source](https://github.com/lawler61/blog/tree/master/js/mobx-task-manage/source)

2. 如果反响好的话可以考虑开源（嗯，装13而已），同时欢迎 folk 完善

3. 另外，我是写完这个 util 才发现 github 已经有位大佬完成了[类似的工具 mobx-task](https://github.com/jeffijoe/mobx-task)，看了下，和他源码以及使用姿势完全不同，但同样可作为参考

4. 喜欢的小伙伴，记得留下你的小 ❤️ 哦~
