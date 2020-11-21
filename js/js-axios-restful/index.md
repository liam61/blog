# axios: restful 风格的二次封装

目前前端发送异步请求主要是：ajax、fetch、axios，对于三者的区别就不做具体的阐述

本文以 axios 为例，讲解异步请求在项目中的具体应用

## axios 优点

1. axios 的一大优点就是灵活，可以直接使用 axios 对象，也可以传递 AxiosRequestConfig 参数实例化后使用

2. 请求方法可以使用函数调用，也可以传递 config 对象，像 $.ajax 一样使用

3. 请求和相应拦截器 interceptors 帮助我们更好的进行权限处理

## 封装成类

1. 接口说明

```js
interface IReqOptions {
  uri?: string
  query?: object | null
  data?: { [key: string]: any }
}

type resType = 'success' | 'fail' | 'info'

// 响应接口
interface IResponse {
  status: number
  statusText: string
  data: { type: resType; message: string; [key: string]: any }
}
```

2. axios 封装类，使用单例模式

```js
import axios, { AxiosRequestConfig, AxiosInstance } from 'axios'
import qs from 'qs'
import { IReqOptions, IResponse } from '../interface'

class Request {
  static instance: Request
  request: AxiosInstance
  path = ''
  curPath = ''

  constructor(options: AxiosRequestConfig) {
    this.request = axios.create(options)

  }

  static getInstance(options: AxiosRequestConfig = { baseURL: 'your_api_url' }) {
    if (!this.instance) {
      this.instance = new Request(options)
    }
    return this.instance
  }

  async get(options = { uri: '', query: null }) {
    const { uri, query } = options

    let url = this.curPath + (uri ? `/${uri}` : '')
    url += query ? `?${qs.stringify(query)}` : ''

    let result = {}

    try {
      const { data: response }: IResponse = await this.request.get(url)

      result = response
    } catch (err) {
      console.error(err)
    }

    return result
  }

  async post(options = { uri: '', data: {} }) {
    const { uri, data } = options

    let url = this.curPath + (uri ? `/${uri}` : '')
    let result = {}

    try {
      const { data: response }: IResponse = await this.request.post(url, data)

      result = response
    } catch (err) {
      console.error(err)
    }

    return result
  }

  setPath(...paths: string[]) {
    this.curPath = `${this.path}/${paths.join('/')}`

    return this
  }
}

export default Request.getInstance()
```

## 优化

1. 抽离请求方法

> 如果 `get、post、put、delete` 等方法全都写一遍会很麻烦，所以将它们抽离成通用方法

```js
/**
 * 请求的通用方法
 *
 * @param {string} method
 * @param {string} [options={ uri: '', query: null, data: null }]
 * @param {string} [options.uri=''] 资源唯一标示，一般是 ID
 * @param {Object} [options.query=null] GET 参数
 * @param {Object} [options.data={}] POST/PUT/PATCH 数据
 * @returns {Promise<any>}
 */
async getRequest(method: string, options: IReqOptions = { uri: '', query: null, data: {} }) {
  const { uri, query, data } = options

  let url = this.curPath + (uri ? `/${uri}` : '')
  url += query ? `?${qs.stringify(query)}` : ''

  let result = {}

  try {
    const { data: response }: IResponse = await this.request[method](url, data)
    result = response
  } catch (err) {
    console.error(err)
  }

  return result
}
```

2. 处理多个链接变量

> 在当前使用中，对于链接中变量 `/:id` 的指定，可以用 `{ uri: 'some_id' }` 处理
>
> 但如果有多个变量，如 `/users/:id/articles/:id`，`uri` 属性就不能很好的处理。所以我们在 `Request` 类中新加一个方法：

```js
/**
 * 替换链接参数
 *
 * @param {...string[]} params
 */
replace(...params: string[]) {
  let count = 0

  this.curPath = this.curPath.replace(/\{.*?\}/g, _match => params[count++])

  return this
}
```

## 使用

```js
GET /users/:id
request.setPath('users').get({ uri: 'lawler' })

POST /users
request.setPath('users').post({
  data: { email: 'lawler61@163.com', password: '123456' }
})

PUT /users/:id
request.setPath('users').put({
  uri: 'lawler', data: { name: 'jeffery' }
})

DELETE /users/:id
request.setPath('users').delete({ uri: 'lawler' })

GET /users/:id/articles?page=2&limit=10
request.setPath('users/{id}/articles').replace('lawler').get({
  query: { page: 2, limit: 10 }
})

PATCH /users/:id/articles/:id
request.setPath('users/{id}/articles/{id}').replace('lawler', 'react 学习之路').patch({
  data: { title: '前端学习' }
})
```

## 源码获取

[react-lighter src/utils/request.ts](https://github.com/lawler61/react-lighter/blob/master/src/utils/request.ts)

## react 脚手架推荐

[react 脚手架地址 -> https://github.com/lawler61/react-lighter](https://github.com/lawler61/react-lighter)
