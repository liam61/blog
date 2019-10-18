export const controllerList: ControllerType[] = [];
export const methodList: MethodType[] = [];
export const paramList: ParamType[] = [];
export const parseList: ParseType[] = [];

export interface ControllerType {
  path: string;
  target: object;
  loaded?: boolean;
}

export interface MethodType {
  target: object;
  name: string;
  type: HttpMethod;
  path: string;
  func: (...args: any[]) => any;
  loaded?: boolean;
}

export interface ParamType {
  key: string;
  index: number;
  type: Param;
  name: string;
  loaded?: boolean;
}

export interface ParseType {
  type: Parse;
  name: string;
  index: number;
  loaded?: boolean;
}

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
export type Param = 'params' | 'query' | 'body' | 'headers' | 'cookies';
export type Parse = 'number' | 'string' | 'boolean';

export function Controller(path = '') {
  // target: controller 类，不是实例
  return (target: object) => {
    controllerList.push({ path, target });
  };
}

export function httpMethod(method: HttpMethod = 'get') {
  return (path = '/') =>
    // target：当前类实例，name：当前函数名，descriptor：当前属性（函数）的描述符
    (target: object, name: string, descriptor: any) => {
      methodList.push({
        target,
        type: method,
        path,
        name,
        func: descriptor.value,
      });
    };
}

export function param(type: Param) {
  return (key?: string) =>
    // target：当前类实例，name：当前函数名，index：当前函数参数顺序
    (target: object, name: string, index: number) => {
      paramList.push({ key, index, type, name });
    };
}

export function Parse(type: Parse) {
  return (target: object, name: string, index: number) => {
    parseList.push({ type, name, index });
  };
}

export const Body = param('body');
export const Headers = param('headers');
export const Cookies = param('cookies');
export const Query = param('query');
export const Get = httpMethod('get');
export const Post = httpMethod('post');
