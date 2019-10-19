# 有趣的装饰器：使用 Reflect Metadata 实践依赖注入

## 简介

1. `控制反转和依赖注入`是常见一种设计模式，在前后端均有很深的应用场景，不了解的小伙伴可以先看下资料：[wiki/设计模式_(计算机)](https://zh.wikipedia.org/wiki/%E8%AE%BE%E8%AE%A1%E6%A8%A1%E5%BC%8F_(%E8%AE%A1%E7%AE%97%E6%9C%BA))，[wiki/控制反转](https://zh.wikipedia.org/wiki/%E6%8E%A7%E5%88%B6%E5%8F%8D%E8%BD%AC)

2. 如果之前有过 Angular 开发经历，那么肯定用过 `Injectable` 和 `Component` 等常见的装饰器，其作用就是完成`控制反转和依赖注入`

3. 对于 node 后端，也同样有很多以 `IoC` 和 `DI` 这套思想为主打的库，比如：[NestJs](https://github.com/nestjs/nest)，[InversifyJs](https://github.com/inversify/InversifyJS) 等

4. 今天主要聊聊这些依赖注入框架下的**装饰器的使用原理与简单实现**，还不了解装饰器的小伙伴看这里：[ES6 入门：装饰器](http://es6.ruanyifeng.com/#docs/decorator)

## 引入

### 一、express 开发

express 开发中，经常能看到这样的代码。为获取核心数据去写一些与业务逻辑无关的代码，数据一多的话，代码就会很冗杂

```js
const app = express();

app.use('/users', (req, res) => {
  const id = req.query.id;
  const uid = req.cookies.get('uid');
  const auth = req.header['authorization'];
  // 业务逻辑...
  res.send(...);
});
```

### 二、nestjs 开发

有了 nest 强力的装饰器，我们可以这样写。把路由抽成一个类，从而更专注和具体的维护；路由参数使用装饰器捕获，直接拿到核心数据，这样代码可读性也变强了

```js
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUserById(@Query('id') id: string, @Headers('authorization') auth: string) {
    return this.userService.getUserBtyId(id, auth);
  }
}
```

### 三、强大的 Reflect Metadata

1. Reflect Metadata 是 ES7 的一个提案，它主要用来在声明的时候添加和读取元数据

2. 在 Angular 2+ 的版本中，控制反转与依赖注入便是基于此实现

3. NestJs 在创作时也是吸收了 Angular 的依赖注入思想

4. 使用很简单，请参考：[reflect metadata api](https://github.com/rbuckton/reflect-metadata#api)

5. 在项目中配置：

```js
// 下载
yarn add reflect-metadata

// tsconfig.json 中添加
"compilerOptions": {
  "types": ["reflect-metadata", "node"],
  "emitDecoratorMetadata": true,
}

// index.ts 根文件中引入
import 'reflect-metadata';
```

## 开撸

设计了两套实现方案，第一套是利用全局变量记录装饰对象完成，供学习使用；第二套是用 reflect metadata 实现

### 一、使用全局变量

> 在 reflect metadata 还没推出之前，node 中的依赖注入是怎么做的呢
>
> 其实就是维护一个全局的 list，通过初始化 controller 时装饰器的调用进行依赖的收集，在客户端请求资源时截获并修改数据

#### 1）定义装饰器

1. 简单的类装饰器

这里只是简单的收集依赖，并不做什么处理

```js
export const controllerList: ControllerType[] = [];

export function Controller(path = ''): ClassDecorator {
  // target: controller 类，不是实例
  return (target: object) => {
    controllerList.push({ path, target });
  };
}
```

2. http 请求装饰器

根据 http 方法又封装了一层而已

```js
export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export const routeList: RouteType[] = [];

export function createMethodDecorator(method: HttpMethod = 'get') {
  return (path = '/'): MethodDecorator =>
    // target：当前类实例，name：当前函数名，descriptor：当前属性（函数）的描述符
    (target: object, name: string, descriptor: any) => {
      routeList.push({ type: method, target, name, path, func: descriptor.value });
    };
}

// 使用
export const Get = createMethodDecorator('get');
export const Post = createMethodDecorator('post');
```

3. 参数装饰器

根据参数封装了一层

```js
export type Param = 'params' | 'query' | 'body' | 'headers' | 'cookies';

export const paramList: ParamType[] = [];

export function createParamDecorator(type: Param) {
  return (key?: string): ParameterDecorator =>
    // target：当前类实例，name：当前函数名，index：当前函数参数顺序
    (target: object, name: string, index: number) => {
      paramList.push({ key, index, type, name });
    };
}

// 使用
export const Query = createParamDecorator('query');
export const Body = createParamDecorator('body');
export const Headers = createParamDecorator('headers');
```

4. 类型装饰器

这类装饰器属于优化，用法同 Query 等装饰器

```js
export type Parse = 'number' | 'string' | 'boolean';

export const parseList: ParseType[] = [];

export function Parse(type: Parse): ParameterDecorator {
  return (target: object, name: string, index: number) => {
    parseList.push({ type, index, name });
  };
}
```

#### 2）装饰器注入（register）

1. 三层遍历注入

> controller 的遍历，配置所有根路由
>
> route 的遍历，配置当前根路由下的子路由
>
> param 和 parse 的遍历，配置当前路由函数中的各个参数

```js
const router = express.Router(); // 初始化路由

controllerList.forEach(controller => {
  const { path: basePath, target: cTarget } = controller;

  routeList
    // 取出当前根路由下的 route
    .filter(({ target }) => target === cTarget.prototype)
    .forEach(route => {
      const { name: funcName, type, path, func } = route;
      // handler 即我们常见的 (res, req, next) => {}
      const handler = handlerFactory(
          func,
          // 取当前路由函数下装饰的参数列表
          paramList.filter(param => param.name === funcName),
          parseList.filter(parse => parse.name === funcName),
        );
      // 配置 express router
      router[type](basePath + path, handler);
    });
});

// 将装载好的 router 放到 express 中
app.use('/', router);
```

2. 路由处理函数工厂

```js
export function handlerFactory(func: (...args: any[]) => any, paramList: ParamType[], parseList: ParseType[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 获取路由函数的参数
      const args = extractParameters(req, res, next, paramList, parseList);
      const result = await func(...args);
      res.send(result);
    } catch (err) {
      next(err);
    }
  };
}
```

3. 根据 req 处理装饰的结果

```js
export function extractParameters(
  req: Request,
  res: Response,
  next: NextFunction,
  paramArr: ParamType[] = [],
  parseArr: ParseType[] = [],
) {
  if (!paramArr.length) return [req, res, next];

  const args = [];
  // 进行第三层遍历
  paramArr.forEach(param => {
    const { key, index, type } = param;
    // 获取相应的值，如 @Query('id') 则为 req.query.id
    switch (type) {
      case 'query':
        args[index] = key ? req.query[key] : req.query;
        break;
      case 'body':
        args[index] = key ? req.body[key] : req.body;
        break;
      case 'headers':
        args[index] = key ? req.headers[key.toLowerCase()] : req.headers;
        break;
      // ...
    }
  });

  // 小优化，处理参数类型
  parseArr.forEach(parse => {
    const { type, index } = parse;
    switch (type) {
      case 'number':
        args[index] = +args[index];
        break;
      case 'string':
        args[index] = args[index] + '';
        break;
      case 'boolean':
        args[index] = Boolean(args[index]);
        break;
    }
  });

  args.push(req, res, next);
  return args;
}
```

#### 3）使用装饰器

接来下就是愉快的使用时间 😏

```js
@Controller('/') // 装饰 controller
export default class Index {
  @Get('/') // 装饰 route
  index(@Parse('number') @Query('id') id: number) { // 装饰参数
    return { code: 200, id, message: 'success' };
  }

  @Post('/login')
  login(
    @Headers('authorization') auth: string,
    @Body() body: { name: string; password: string },
    @Body('name') name: string,
    @Body('password') psd: string,
  ) {
    console.log(body, auth);
    if (name !== 'lawler' || psd !== '111111') {
      return { code: 401, message: 'auth failed' };
    }
    return { code: 200, token: 't:111111', message: 'success' };
  }
}
```

### 二、reflect metadata

除了代码书写的不同，思想完全一样

#### 1）定义装饰器

```js
export const CONTROLLER_METADATA = 'controller';
export const ROUTE_METADATA = 'method';
export const PARAM_METADATA = 'param';

export function Controller(path = ''): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, path, target);
  };
}

export function createMethodDecorator(method: HttpMethod = 'get') {
  return (path = '/'): MethodDecorator =>
    (target: object, name: string, descriptor: any) => {
      Reflect.defineMetadata(ROUTE_METADATA, { type: method, path }, descriptor.value);
    };
}

export function createParamDecorator(type: Param) {
  return (key?: string): ParameterDecorator =>
    (target: object, name: string, index: number) => {
      // 这里要注意这里 defineMetadata 挂在 target.name 上
      // 但该函数的参数有顺序之分，下一个装饰器定义参数后覆盖之前的，所以要用 preMetadata 保存起来
      const preMetadata =
        Reflect.getMetadata(PARAM_METADATA, target, name) || [];
      const newMetadata = [{ key, index, type }, ...preMetadata];

      Reflect.defineMetadata(PARAM_METADATA, newMetadata, target, name);
    };
}
```

#### 2）装饰器注入

```js
const router = express.Router();

const controllerStore = {
  index: new IndexController(),
  user: new UserController(),
};

Object.values(controllerStore).forEach(instance => {
  const controllerMetadata: string = Reflect.getMetadata(CONTROLLER_METADATA, instance.constructor);

  const proto = Object.getPrototypeOf(instance);
  // 拿到该实例的原型方法
  const routeNameArr = Object.getOwnPropertyNames(proto).filter(
    n => n !== 'constructor' && typeof proto[n] === 'function',
  );

  routeNameArr.forEach(routeName => {
    const routeMetadata: RouteType = Reflect.getMetadata(ROUTE_METADATA, proto[routeName]);
    const { type, path } = routeMetadata;
    const handler = handlerFactory(
        proto[routeName],
        Reflect.getMetadata(PARAM_METADATA, instance, routeName),
        Reflect.getMetadata(PARSE_METADATA, instance, routeName),
      );
    router[type](controllerMetadata + path, handler);
  });
});
```

## 测试

1. [Demo 源码获取](https://github.com/lawler61/blog/tree/master/server/ts-decorator/demo)

2. 如何运行：`yarn && yarn start`

3. 测试 url，建议使用 postman

- get: http://localhost:8080?id=66666

- post: http://localhost:8080/login

> body: { name: 'lawler', password: '111111' }

- get: http://localhost:8080/users?id=66666

> headers: { authorization: 't:111111' }
>
> body: { name: 'lawler', password: '111111' }

- post: http://localhost:8080/users?id=66666
>
> headers: { authorization: 't:111111' }
>
> body: { name: 'lawler', password: '111111', gender: 0 }

## 参考资料

- [深入理解 TypeScript](https://jkchao.github.io/typescript-book-chinese/tips/metadata.html#controller-%E4%B8%8E-get-%E7%9A%84%E5%AE%9E%E7%8E%B0)

- [inversify-express-utils](https://github.com/inversify/inversify-express-utils)

- [Javascript 装饰器的妙用](https://juejin.im/post/5b41f76be51d4518f140f9e4)

喜欢的记得点 ❤️哦~
