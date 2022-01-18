
# Server Components 笔记

早就想写篇关于 server components 的文章了，年底终于有时间了

不可能三角：这是一个关于体验（user experience）、可维护性（maintenance）、性能（performance）抉择的故事

## 运作流程

1. server / 返回前端 build 的 html，加载 client entry.js

![request](./images/1.request.png)

2. client `userServerResponse` 发送 `/react` 接口，获取 server 吐出的 server components，并用 `@` 开头特殊的 type 标记了 chunk

![response](./images/2.response.png)

3. client 通过 `webpack 运行时插件` 拉取 chunks，并更新视图

## 原理相关

1. server 中调用的 client 组件，只在吐 server components 时使用，server 并没有实际感知这个文件。最终执行还是在 client 中，所以能正常使用 client 的上下文。另外 server 组件会被层层解析出来

2. server 使用到的 client 组件，由 client build 时 [react webpack 插件抽的 chunk](https://github.com/facebook/react/blob/51947a14bb/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js#L99)，默认处理 [xxx.client.xx 文件](https://github.com/facebook/react/blob/51947a14bb/packages/react-server-dom-webpack/src/ReactFlightWebpackPlugin.js#L82)

3. client webpack 运行时 api 中，通过判断 server components 返回的 k-v 中的 [k 的首字母来判断是哪种类型](https://github.com/facebook/react/blob/51947a14bb/packages/react-client/src/ReactFlightClientStream.js#L43)，如果是 module 则调用 \_\_webpack_require__ 加载

![resolve](./images/3.resolve.png)

- 其中 M 后面的数字，如 `M5`，和 server components 中的以 `@` 后的数字一一对应，如 `@5` 

4. client 发送 `/react` 请求时可以通过 query 参数给 server 或 client 组件传递 props。client 可自行维护 Map 缓存，如果 query 参数相同，则前端直接返回

6. server 缓存优化: 生成 server components 时使用了 createRequest，其自带 react internal cache。[request 的实现](https://github.com/facebook/react/blob/51947a14bb/packages/react-server/src/ReactFlightServer.js#L108) 跟 react-loadable 差不多

## 优点

1. client 更小的打包体积：在 tree-shake 基础上，还能将更重的运行时依赖存放于后端

2. 赋予组件操作数据的能力：将原本通过接口驱动状态的组件，放于服务端来获取数据

3. 可以有前后端共享组件

4. code split 自动化：前端只根据 server component 返回的 id 去加载 chunk

5. 状态设置：返回的 server component 比 SSR 返回的静态 html 更加灵活

## 缺点

1. 增加了服务端压力

2. concurrent mode 不稳定

3. server 会嵌套 client 组件，调用混乱

4. RSC 无法做 SEO，还是需要配合 SSR

5. client、server、shared 组件使用 hooks、server api 等能力也需要合理区分

## 看法

期待后续发展，大胆尝试，谨慎上线

## 参考资料

- [Introducing React Server Components](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html)

- [server-components-demo](https://github.com/reactjs/server-components-demo)

- [react-server-dom-webpack](https://github.com/facebook/react/blob/51947a14bb/packages/react-server-dom-webpack/src/ReactFlightDOMServerNode.js)

- [如何看待 React Server Components？](https://www.zhihu.com/question/435921124)

- [【react】初探server component](https://juejin.cn/post/6918602124804915208#heading-4)
