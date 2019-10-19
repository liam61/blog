import { Express, Router, Request, Response, NextFunction } from 'express';

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
export type Param = 'params' | 'query' | 'body' | 'headers' | 'cookies';
export type Parse = 'number' | 'string' | 'boolean';

export interface ControllerType {
  path: string;
  target: object;
}

export interface RouteType {
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
}

export interface ParseType {
  type: Parse;
  index: number;
  name: string;
}

export function handlerFactory(
  func: (...args: any[]) => any,
  paramList: ParamType[],
  parseList: ParseType[],
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const args = extractParameters(req, res, next, paramList, parseList);
      const result = await func(...args);

      res.send(result);
    } catch (err) {
      next(err);
    }
  };
}

export function extractParameters(
  req: Request,
  res: Response,
  next: NextFunction,
  paramArr: ParamType[] = [],
  parseArr: ParseType[] = [],
) {
  if (!paramArr.length) return [req, res, next];

  const args = [];

  paramArr.forEach(param => {
    const { key, index, type } = param;
    // console.log(req.body, req.query);
    switch (type) {
      case 'query':
        args[index] = key ? req.query[key] : req.query;
        break;
      case 'body':
        args[index] = key ? req.body[key] : req.body;
        break;
      case 'params':
        args[index] = key ? req.params[key] : req.params;
        break;
      case 'headers':
        args[index] = key ? req.headers[key.toLowerCase()] : req.headers;
        break;
      case 'cookies':
        args[index] = key ? req.cookies[key] : req.cookies;
        break;
      default:
        args[index] = res;
        break;
    }
  });

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
