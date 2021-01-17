# 从零手写一个迷你的 RxJs 响应式编程库

[D2前端峰会——无界](https://www.alibabaf2e.com/) 前几周在杭落幕，邀请了一众大佬们分享技术。其中还有几个国外大佬在线撸代码，看着极为过瘾

其中 `Ben Lesh` 作为 `RxJs` 的维护者，[分享了其下一代的重构历程](https://www.yuque.com/zaotalk/nt/d2-15-1)，让我产生了浓厚的兴趣，于是自己试着实现了个迷你版

## 介绍

### 一、基本概念

1. [响应式编程 Reactive Programming](https://zh.wikipedia.org/wiki/%E5%93%8D%E5%BA%94%E5%BC%8F%E7%BC%96%E7%A8%8B) 或 [函数式编程 Functional Programming](https://zh.wikipedia.org/wiki/%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BC%96%E7%A8%8B) 是一种编程范式，函数作为“一等公民”，通过结构化的编程方式来更好的声明和管理任务，详细就不多说了

2. 响应式编程是在函数式编程的基础上提出的，它结合了观察者模式和迭代器模式等，来达到管理序列任务的目的。引用自 [RxJs docs](https://rxjs.dev/guide/overview)

### 二、`Callbag`

1. Ben Lesh 提到了最初创建 RxJs 的灵感来自于 Callbag，于是我先刷了一波 [Callbag](https://github.com/callbag/callbag) 才看的 RxJx 源码

2. Callbag 是一种轻量级的响应式编程标准，并不是具体的实现，当然这个大佬有根据这个标准实现了 [callbag-basics](https://github.com/staltz/callbag-basics)


3. 里面提到了“可观察对象”和“观察者”，以及两者通信的重要的概念，当然结合 [Rxjs的官网](https://rxjs.dev/guide/overview) 我们可以将两者合并总结下：

### 三、核心概念

1. `Observable` 可观察的对象，有 `Pullable` 和 `Pushable` 之分

- `Pullable` 可拉取的可观察对象，即每次观察者需要数据时从该 Observable 拉取

    - 每一个 `JavaScript Function` 都可以看做是一种可拉取的模式，帮助你来理解这个概念，试想下我们如何调用 JS 函数的

    - 这时观察者是主动的，Observable 是被动的，即不知道观察者什么时候请求数据

- `Pushable` 可推送的可观察对象，即 Observable 可以主动推送数据给订阅自己的观察者

    - 你可以用 `Promise + Then` 的模式来理解，试想下我们在 Promise 构造函数中调用 resolve、reject 并把结果传递给往后一个个 Then 函数的过程吧

    - 这时 Observable 是主动的，观察者是被动的，即不知道 Observable 什么时候推送数据来

2. `Observer` 观察者，可订阅 Observable，订阅时传给 Observable 自己的回调，你可以理解为是通信

3. `Operators` 指令集，方便我们以结构化的方式来操作和控制流程，常见的有：

- `Creation Operators`，如 from、of、interval，创建 Observer

- `Transformation Operators`，如 map、pluck，操作 Observer

- `Filtering Operators`，如 filter、take，过滤 Observer

## 在 Callbag 中实现

先不着急怼 RxJs，先看看 Callbag

### 一、sink

1. **基本的组成原子，可以作为可观察对象（这里用的是 source）或者观察者（listener）**

2. sink 是个函数，接受两个入参，type 和 payload，返回 void

- type 只有三种类型：

  - 0：start，通信开始

  - 1：data，数据传输

  - 2：end，结束通信

- payload，可以传递 **具体 data 或者 sink**

3. 所有 sink（source 或是 listener）要想建立连接，必须先与对方进行一次 type 为 0 通信，即 sink1 给 sink2 发送了 type 0，sink2 要想与 sink1 建立通信也要 **talkback** 一次 type 0，这个过程叫做 **handleshake**

4. 在 type 0 的基础上之后，就可以用 type 1 传递具体 payload 了

5. 任意一方可以以 type 2 告知对方可以结束通信了，对方不用 talkback

### 二、source

1. 如何使用：我们想用 from 和 map operator 来处理一个 array，并遍历打印结果

```js
const source = pipe(
  from([3, 5, 8]),
  map((n, i) => n * 2 + "-map-" + i)
);

each((n, i) => console.log(n, i))(source);

// logs：
// 6-map-0 0
// 10-map-1 1
// 16-map-2 2
```

2. from：to create iterable source

先撸可观察对象，首先明确一点，如果没有接收到 listener sink 的 type 0，这个 source sink 并没nuan用，无论是 pullable 还是 pushable

```js
const START = 0;
const DATA = 1;
const END = 2;

// 接受一个 iter 作为入参，返回 source sink
// 这个 source sink 接受的第二个参数 payload 是个 sink，看清楚结构哦~
// payload 为 sink 原因是，你总得给 from operator 把数据传出去的机会吧，这里面都是用 sink 通信，那就传 sink 咯
const from = (iter) => (type, sink) => {
  // 如果 listener 不先传 0，source 没有nuan用
  if (type !== START) return;

  // 偷懒简单实现，更通用的方式是利用 iterator
  if (Array.isArray(iter)) {
    const len = iter.length;
    let inLoop = true;
    let i = 0;

    // 数据准备好了，既然是 sink 嘛，那还得先建立通信咯
    sink(START, (t) => {
      if (i === len) return;
      // 静候 type 1 的到来，传出数据
      if (t === DATA) {
        sink(DATA, { v: iter[i], i: i++, o: iter });
        if (i === len && inLoop) {
          inLoop = false;
          // 遍历完了断开通信
          sink(END);
        }
      }
      // listener 主动断开连接
      if (t === END) sink(END);
    });
  }

  // if (toString.call(source) === "[object Object]") {}
};
```

3. map operator: to transform source

```js
// 接受用户层面的 callback 和 this，这个大家比较熟悉
// 然后跟 from 一样接受先 source sink（即 from 的 iter 参数）作为 pullable 的数据源
// 当然最后自己也返回一个 sink，这个 sink 的第二个参数是个 sink，原因也和 from 一样，你得让我把处理完的数据传出去吧
const map = (callback, thisArg) => (source) => (type, sink) => {
  if (type !== START) return;
  let i = 0;

  // 数据准备好了，与 source 建立通信
  source(START, (t, d) => {
    // 静候 type 1 的到来，执行用户层面的 callback 并传出
    sink(t, t === DATA ? callback.call(thisArg, d.v, i++, d.o) : d);
  });
};
```

### 三、listener

好了，读到这我们还没有实质性上的把 type 1 作为输入是吧，只是用了 type 1 来作为判断。来撸个 listener 就全部串起来了

1. each: to consume source

```js
// 接受用户层面的 callback 和 this
// 然后不用像 from 和 map 一样最后还得返回 sink 里套 sink，直接与 source 通信就行。因为自己又不需要把数据传出去
const each = (callback, thisArg) => (source) => {
  let pullable;
  let i = 0;

  // 建立通信
  source(START, (t, d) => {
    // source 收到 listener 的 type 0 后，将内部的 sink 传出来给 listener 使用
    if (t === START) pullable = d;
    // 收到 source 返回数据，执行用户逻辑
    if (t === DATA) callback.call(thisArg, d, i++);
    // 数据遍历完了，结束
    if (t === END) pullable = null;

    // 收到 0 或 1，开始消费 source
    if (t !== END) pullable(DATA);
  });
};
```

### 四、pipe

一行代码，第一个参数接受一个 source sink，传到各个 operator

```js
const pipe = (source, ...callbacks) => callbacks.reduce((prev, cb) => cb(prev), source);
```

先回到前面看看使用例子或者跑下 demo 吧

## RxJs

收拾好了我们就开始上正菜吧

### 一、Callbag 的升级

callbag 传递出来的思想固然迷人，但使用起来还是不方便，为啥呢

1. 我（library developer）得一直和 0、1、2 打交道，不舒服

2. 参数里 sink 嵌 sink 增加了不少理解成本

3. 这种函数式编程的代码组织方式让我（user）不够舒服，不够优雅，我想链式调用

4. 另外如果我拓展自己的 operator 时也会遇到上面的几个问题

```js
// 如这么写
from([3, 5, 8]).pipe(
  map((n, i) => n * 2 + "-map-" + i),
  filter(...)
).subscribe((n) => console.log(n));
```

### 二、Observable

于是 Observable 成为了 RxJs 的基本原子，它将“数据生成”、“pipeable”、“链式感知”集于一体，让我们舒服的书写，**就像 Promise 一样**

1. 基本架子

```js
interface Observer<T> {
  next: (value: T, index?: number) => void;
  error: (err: any) => void;
  complete: () => void;
}

type Producer<T> = (subscriber: Subscriber<T>) => void;

class Observable<T> {
  // 构造时接受一个 data producer，这个函数接受 subscriber 作为入参
  // 用户层面就可以操作 subscriber 的 next、error 等方法自行生产数据
  constructor(public producer: Producer<T> = noop) {}

  // 用户主动调用 .subscribe 传入 next、error 等
  subscribe(next, error, complete) {
    const subscriber = new Subscriber({ next, error, complete });
    this.producer(subscriber);
    return subscriber;
  }

  // pipe 直接传 operators
  pipe(...operators): Observable {
    return operators.reduce((prev, operator) => operator(this), this);
  }
}
```

2. 由此我们看到，**当用户主动调用 subscribe 时我们才会 new Subscriber 并执行 producer**，这点尤其重要，紧记

```js
const subscription = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
}).subscribe(
  (n) => console.log("next: get num", n),
  (err) => console.log("error:", err),
  () => console.log("complete");
);
```

### 三、Subscriber

1. 对于 type 0、1、2，RxJs 中引入了 Observer 和 Subscription，它包含了 next, error, complete 三方法

2. 其中对应关系是：

```js
type 0 <-> observable.subscribe

type 1 <-> observer.next

type 2 <-> subscription.unsubscribe
```

3. Subscriber 是 Observer 的具体实现，即将三个方法封装嘛

```js
interface Observer<T> {
  next: (value: T, index?: number) => void;
  error: (err: any) => void;
  complete: () => void;
}

class Subscriber<T> implements Observer<T> {
  public isClosed = false;
  protected destination: Observer<T>;

  constructor(destination: Partial<Observer<T>>) {
    this.destination = {
      ...defaultDestination,
      ...destination
    };
  }

  next(value: T, index?: number) {
    if (this.isClosed) return;
    this.destination.next(value, index);
  }

  error(err: any) {
    if (this.isClosed) return;
    this.isClosed = true;
    this.destination.error(err);
    this.unsubscribe();
  }

  complete() {
    if (this.isClosed) return;
    this.isClosed = true;
    this.destination.complete();
    this.unsubscribe();
  }

  unsubscribe() {
    this.isClosed = true;
    this.destination = defaultDestination;
  }
}
```

### 四、Observable lift！

当然这样写还运行不了，原因上面我用“着重号”标出来了。你也不是想想你 [手撸 Promise](https://promisesaplus.com/) 时经历过什么，说人话是吧，好的，就是链式调用要提供一个新的 Promise 实例啊

1. Observable.pipe 也要提供新的 Observable 实例

2. 但是对于 Rxjs 难就难在这一点，为啥，之前也标过，就是用户主动调用 Observable.subscribe 时（当然如果是链式调用的话就是针对于最后生成的那个），我们才会 new Subscriber 并执行 producer，这是个 lazy call 的过程

3. 并且一个 Observable 对应一个 subscriber，其他 Observable 不能调用别人的 subscriber

4. 但问题来了，我们只在第一个 new Observable 时才在它的构造函数中传了 producer，但返回的最后的 Observable，其构造函数当然我们是感知不到的

5. 所以呢，所以就“链式感知“呗，说白了就是函数传递嘛，当然 RxJx 对于这点还做了很多工作，包括异步状态的收集管理，链路上 Observables 的引用等，喜欢的自行 dive 吧~

6. Observable lift

```js
export default class Observable<T> {
  // lift 时使用，表示上一个 new 的 Observable
  protected origin: Observable<any> | null = null;
  // 传递的函数
  protected operator: Operator<any, any> | null = null;

  constructor(public producer: Producer<T> = noop) {}

  subscribe(next, error, complete) {
    const subscriber = new Subscriber({ next, error, complete });

    // lift 过来，传递 nextSubscriber 即可
    if (this.operator) {
      this.operator(subscriber, this.origin!);
    } else {
      this.producer(subscriber);
    }
    return subscriber;
  }

  protected lift<R>(operator: Operator<R, T>): Observable<R> {
    const observable = new Observable<R>();
    // 传递就完事
    observable.origin = this;
    observable.operator = operator;
    return observable;
  }

  pipe(...operators: Operator<any, any>[]): Observable<any> {
    return operators.reduce(
      // 返回一个新的 Observable，一调用 subscribe，就会在其内部调用 origin 的 subscribe
      (prev: Observable<any>, operator) => prev.lift(operator),
      this
    );
  }
}
```

### 五、Operators

1. Observable 封装的这么完善了，Operators 就简单多了，老规矩 from 和 map

```js
export const from = <T>(input: T[]) => {
  // 简单实现了
  if (Array.isArray(input)) {
    return new Observable<T>((subscriber) => {
      input.some((n, i) => {
        if (subscriber.isClosed) return true;
        // 通过 type 1 往外传数据
        // 当然整个 producer 函数要在用户调用 .subscribe（type 0）后才会执行
        subscriber.next(n, i);
      });

      // type 2
      subscriber.complete();
    });
  }
};
```

2. map operator

```js
// 接受用户侧的 callback 和 this
// map 返回值是一个函数，接受两个入参，nextSubscriber 和 origin，前者是最后一个 Observable 的 subscriber，后者是上一个 Observable
// 如果到这你还不明白为啥需要这两个，建议你重新看看 “四、Observable lift！”
export const map = <V, R>(
  project: (value: V, index: number) => R,
  thisArg?: any
): Operator<V, R> => (nextSubscriber, origin) => {
  let i = 0;

  // 在这才会生成 origin 的 subscriber
  const _subscription = origin.subscribe((value) => {
    try {
      // 执行用户侧逻辑
      nextSubscriber.next(project.call(thisArg, value, i), i++);
    } catch (err) {
      nextSubscriber.error(err);
    }
  });
};
```

3. 再加个 [interval creation operator](https://rxjs.dev/api/index/function/interval)，方便我们测试 unsubscribe

当然对于 async tasks，RxJs 用了 [Scheduler](https://rxjs.dev/guide/scheduler) 来维护，我们就简单实现

```js
const timers = {};

const interval = (delay = 1000) => {
  return new Observable<number>((subscriber) => {
    let tick = 0;
    timers.interval = setInterval(() => {
      if (subscriber.isClosed) {
        clearInterval(timers.interval);
        return;
      }
      // 每秒产生一个 tick
      subscriber.next(tick++);
    }, delay);
  });
};

// 当然 Subscriber 要稍微改造下
export default class Subscriber<T> implements Observer<T> {
  public isClosed = false;
  protected destination: Observer<T>;

  next(value: T, index?: number) {}
  error(err: any) {}
  complete() {}

  unsubscribe() {
    this.isClosed = true;
    this.destination = defaultDestination;
    // 应该还要判断该 timer 和 当前 Subscriber 的关系
    // 如果在这条 source -> pipe -> nextSource 链上才 clear
    Object.values(timers).forEach((timer) => clearInterval(timer));
  }
}
```

### 六、去吧 `minrx`

```js
const subscription = interval(1000)
  .pipe(map((n, i) => n * 2 + "-map-" + i))
  .subscribe((n) => console.log("get", n));

setTimeout(() => {
  subscription.unsubscribe();
}, 3100);

// logs
// get 0-map-0
// get 2-map-1
// get 4-map-2
```

## 最后

1. 我们通过两个例子来实际感受了响应式编程中的“可观察对象”和“观察者”，以及两者通信的基本概念

2. 可以看到 RxJs 也是在 Callbag 的基础概念下完成的，只是换了一种我们更熟悉的的方式呈现，清晰了代码结构，提高了阅读性和可拓展性

3. 然而我们只是熟知了响应式编程中的最基本的概念，无论是响应式编程本身还是 RxJs 都还有很多东西值得挖掘

4. 希望你能在日后的编程中，**赋过程予意义，赋操作予灵魂**

5. 源码获取：[minrx demo](https://github.com/lawler61/blog/tree/master/js/mini-rxjs/demo)

6. 码字不易，喜欢的小伙伴，记得留下你的小 ❤️ 哦~

## 参考资料

- [函数式编程初探](http://www.ruanyifeng.com/blog/2012/04/functional_programming.html)

- [callbag](https://github.com/callbag/callbag)

- [callbag-basics](https://github.com/staltz/callbag-basics)

- [RxJs](https://rxjs.dev/guide/overview)
