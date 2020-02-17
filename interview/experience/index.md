# 你需要的前端面经

## 个人情况

成都，双非本科，大三开始正式学习前端，主攻 react，目前大四。已拿字节跳动、网易、美团 offer

## 字节跳动面经

### 一、笔试，2 个小时

一共 8 道问答题，有问答、编程、手撸原理等。当初以为全部是高难度算法，准备了好久的算法，结果考的很少。不得不说字节跳动的前端提前批挺人性的（单从我角度上看）

1. 实现一个类可以完成事件 on, once, trigger, off

> 关键词：订阅-发布模式
>
> 详见：[https://github.com/lawler61/blog/issues/1](https://github.com/lawler61/blog/issues/1)

2. 发布新闻时需要提醒发布的时间。写一个函数，传递一个参数为时间戳，完成时间的格式化。如果发布一分钟内，输出：刚刚；n 分钟前发布，输出：n分钟前；超过一个小时，输出：n小时前；超过一天，输出：n天前；但超过一个星期，输出发布的准确时间

> 详见：[https://github.com/lawler61/blog/issues/2](https://github.com/lawler61/blog/issues/2)

3. 谈谈计算机中原码，反码，补码以及它们之间的转换

> 关键词：正数、负数、0

4. 格式化数字。输入：12345，输出：12,234；输入：2345.6789，输出：2,345.6789。要求：使用正则和非正则两种方式实现

> 详见：[https://github.com/lawler61/blog/issues/3](https://github.com/lawler61/blog/issues/3)

5. 给一段文本，将文本数组化，示例如下：

```js
asd ehe  rjr
d  erregrnt eruk
rth sthst ar   gae

// 输出
[asd, ehe, rjr]
[d, erregrnt, eruk]
[rth, sthst, ar, gae]
```

### 二、一面，视频面，90 分钟

笔试难度整体中等偏上，2 天后，hr 打电话说过了，约个面试时间

1. 自我介绍

2. mobx 和 redux 区别

3. http 常用的请求方式，区别和用途

> 关键词：get，post，put，delete...

4. http 常用的状态码和使用场景

> 关键词：1x - 5x

5. http 缓存

> 关键词：强缓和协商缓存

6. http2

> 关键词：信道复用，server push

7. 来写写代码，好勒

- css div 垂直水平居中，并完成 div 高度永远是宽度的一半（宽度可以不指定）

- 下面代码执行顺序，并解释

```js
  async function async1() {
    console.log('async1 start');
    await async2();
    console.log('async1 end');
  }

  async function async2() {
    console.log('async2');
  }

  console.log('script start');

  setTimeout(function () {
    console.log('setTimeout');
  }, 0);

  async1();

  new Promise(function (resolve) {
    console.log('promise1');
    resolve();
  }).then(function () {
    console.log('promise2');
  });

  console.log('script end');
```

- 实现函数能够深度克隆 js 各种数据类型。附加题：实现对象中嵌套数组，数组中嵌套对象

> 详见：[https://github.com/lawler61/blog/issues/4](https://github.com/lawler61/blog/issues/4)

8. 前端性能优化

> 关键词：html，js，服务器

个人感受：一面是北京的一个小姐姐面的，问的问题偏基础，很中肯

### 三、二面，视频面，70 分钟

当前晚上就收到 hr 电话说过了，约个时间二面

1. 讲讲订阅-发布模式，有几种实现方式

> 关键词：listener、Object.defineProperty

2. 事件流

3. 事件是如何实现的

> 关键词：订阅-发布模式

4. mobx 实现原理

> 关键词：Object.defineProperty，自定义数据类型提供操作 api

5. 讲讲 redux 及其原理

> 关键词：发布-订阅模式 + reducer 纯函数管理

6. react 生命周期

7. diff 原理，key 如何使用

> 关键词：先根据 key 找，再遍历查找

8. setState 是否异步，为什么。如果连续 setState 5 次，react 如何处理

> 关键词：react 事件中 setState 浅合并

9. 来写写代码

- 实现这么一个类可以完成如下输出（可以不用到类中的函数）

```js
  class Observer {
    $on() {}

    $emit() {}
  }

  const data = new Observer({ a: 1 });
  console.log(data.a); // 输入: 1
  data.$on("a", (newValue, oldValue) => {
    console.log(newValue, oldValue);
  });
  data.a = 2; // 输入: 2 1
```

> 详见：[https://github.com/lawler61/blog/issues/5](https://github.com/lawler61/blog/issues/5)

10. new 一个构造函数发生了什么

> 关键词：除了那 4 步，还可以从 EC，AO，VO 对象上说

个人感受：二面明显难度加大许多，一面面基础，二面面框架，就连手写代码都是 Vue 的基本实现原理。以为会凉，伤心好久

### 四、三面，视频面，60 分钟

过了两天，hr 打电话说过了，约个三面时间，面试官忙，改到了下周

1. 讲下 MVVM 和 MVC

2. 讲下两者的区别，什么场景下适合用

3. 讲下 angularJS 和 angular 的区别

4. 为什么 angular 取消默认双向绑定

5. 还用过其他架构吗（估计想问 MVP）

6. new 一个构造函数，如果构造函数返回 return {}、return null，会出现什么情况

> 关键词：还可以试试 return 1; return true; 会出现什么情况

7. CDN 原理

> 关键词：DNS 查询，负载均衡

8. 来写写代码

- 顺序发送 4 个请求 a，b，c，d，要求按照顺序输出，即如果先返回 b，则不输出，再返回 a，输出 a，b

> 详见：[https://github.com/lawler61/blog/issues/6](https://github.com/lawler61/blog/issues/6)

9. V8 内存回收机制

> 关键词：老生代，新生代。引用计数、标记清理

10. webpack 打包优化

> 关键词：dll、多线程...

11. 你认为 webpack 哪里打包慢

个人感受：面完后自闭了，三面是偏架构方面，一来就直接怼 MVVM，MVC，没有准备这方面，还好其他问题大部分答上了，扳回一城吧

### 五、整体感受

> 字节跳动无论是前端、后端、移动端都难度都还是在线的，而且每次面试的注重点是明确的，层次是清晰的，难度是把控好的。整个过程中面试官也很给力，看得出来是提前看了简历的，根据之前的面试准备好了问题的。面试完后，会有专门的面试考评团对面试者进行考评，如果有没有考察到的点可能会加一面，这我是第一次听说，不过仔细想想这样没毛病，也体现了这个公司对面试者的重视。总的来说，面试层面上，字节跳动做的相当好

## 网易面经

网易我是没有笔试，某部门直接打电话说面试的，说是补招

### 一、一面，视频面，70 分钟

一面也是个小姐姐，一本正经的

1. mobx、redux 区别

2. react diff 算法

> 关键词：节点查找，同级比较

3. react 事件机制

> 关键词：事件代理，冒泡

4. 原生事件哪些不冒泡，react 如何处理

5. react-redux 原理

> 关键词：context，provider，带上 dispatch

6. 父组件 C 有两个子组件 A、B，B 有 C 传来的 props。问如果 C 传递给 B 的 props 改变了，A 会怎样的处理，执行哪些钩子

7. 讲下 router

> 关键词：链接和视图同步

8. react 15 16 有哪些钩子不同

9.  http 缓存

10. 前端安全有了解吗

> 关键词：xss，csrf

个人感受：网易一面难度整体略微比字节跳动二面低点（就我遇到的而言），感觉网易挺狠的呀，一面都这么难，以为要凉

### 二、二面，现场面，50 分钟

两天后 hr 打电话说一面过了，邀我去北京现场面，小激动

1. 讲讲你用 three.js 做的这个项目

2. 3D 的立体图如何实现

> 关键词：正方体形，球形

3. react 生命周期

4. componentWillMount 和 componentDidMount 的区别

> 关键词：真实 dom

5. react 学习中遇到的难点

6. H5 项目如何适配

> 关键词：vw，rem，fastclick...

7. node 中间件机制

> 关键词：请求截获，挂上属性

8. generator, yield。附加题：co 模块如何实现

> 关键词：线程让权，状态机

9. xss 及防御

> 关键词：储存型、反射型、dom 型

个人感受：现场面等了好久，以为自己走错房间了，我想如果面试官不稍微解释下为啥迟到我就直接不面了。面试官也没有提前准备，拿着简历看了一分多钟才开始

### 三、三面，现场面，30 分钟

由于二面直接过了，二面的面试内容还没有上传上去（因为是现场），三面的面试官同样也没有准备，像是 hr 临时拉上去的，看了简历一分钟才开始。面试过程中还不停用手机催促赶紧发来一、二面内容。所以也没问些啥

1. mobx、redux 区别

2. H5 项目都干了些啥

3. 做的项目流程是怎样的

4. 如何规划一个项目功能

5. 印象深刻的 eslint 规则

6. react 15 16 的区别

> 关键词：钩子，移除模块，createProtal...

个人感受：现场面有点失望，我一直是网易的死忠粉，或许是期望越大失望越大。不过我看网易的现场面确实准备的不充分，等了很久的人不止我一个，甚至还有人来到现场都给安排的视频面，可能是面试官太忙吧，或者出差啥的

### 四、整体感受

> 网易整体面试难度还是有的，就是现场面处理的不是很好。作为死忠粉的我还是要说一句，可能确实是因为面试官太忙了，三面的面试官说面了我马上就急着有事去做。另外在现场等待时，网易的小哥哥小姐姐们也很养眼，颜值在线。嗯，就扳回到这吧

## 美团面经

由于美团是去年秋招拿的 offer，当时觉得自己还是很菜就没发了，能想到多少是多少吧

1. 讲讲 promise

> 关键词：promise A+

2. 防抖和节流

3. flex 布局

> 关键词：justify-content, align-items, basic, shrink, grow

4. xhr，fetch，axios 的区别

5. 用 promise 实现一个请求超时功能

> 关键词：promise.then 与 setTimeout 并行
>
> 详见：[https://github.com/lawler61/blog/issues/7](https://github.com/lawler61/blog/issues/7)

6. three.js 如何创建一个 mesh

7. 讲讲你了解的 three.js 原理

8. 哪些常用排序算法，大概如何实现

## 小技巧

当面试官问，有什么问题问我时，这两个问题我通常是必问的

1. 如果我很有幸来到了 XX 公司，作为实习生 / 应届生的我，公司会有怎样的安排

> 像面试官表现你心中的渴求和对这个公司的喜爱，顺便听下公司业务线自己喜不喜欢

2. 对于刚刚的面试，面试官觉得我有哪些地方不足，或者说可以改进的地方

> 注意！不是让你问 “面试官呀，你觉得我面的怎么样啊，能过不啊”。而是询问就他的工作经验而言，作为一个实习生，自己哪些地方不足，有待加强的地方，无关乎面试结果。但是通过面试官的回答你还是可以大致判断出你给他留下的印象，以及通过的可能性
> 例如：
>
> 1. 字节跳动二面面试官回答的：嗯，你基础还是可以，代码弱了点。
>
> 有些面试官会答的很全面，有些则是一句带过。从这里话里是能看出，我是有一定过的可能性
>
> 2. 字节跳动三面面试官：你看的东西确实很多，但还是要注重实践。
>
> 可以看出还是有过的可能性

## 最后

1. 去年的今天我一样也是愣头青，硬着头皮上战场，然后落得惨败。不过自己还是拼命努力，狂怼基础，硬看源码，每天练习，最后斩获 offer。极少人会在意你的出身（可能你自己算一个），双非依然可以进大厂，只要你足够优秀，能面的面试官闭嘴（指当前阶段的问题中，没有什么能难倒你），那么你就可以反过来选择大厂

2. 加油吧少年！你能行的！
