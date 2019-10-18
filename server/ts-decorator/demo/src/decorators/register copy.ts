import {
  controllerList,
  methodList,
  paramList,
  parseList,
  ParseType,
  ParamType,
} from './decorators';
import { Router, Request, Response, NextFunction } from 'express';

// @ts-ignore
const router = new Router();

controllerList.forEach(controller => {
  const { path: basePath, target } = controller;

  methodList
    .filter(method => method.target === (target as any).prototype)
    .forEach(method => {
      const { name: funcName, type, path, func } = method;
      router[type](
        basePath + path,
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const args = extractParameters(
              req,
              res,
              paramList.filter(param => param.name === funcName),
              parseList.filter(parse => parse.name === funcName),
            );

            if (typeof func === 'function') {
              const result = await func(...args);
              return res.send(result);
            }
            res.status(204);
          } catch (err) {
            next(err);
          }
        },
      );
    });
});

function extractParameters(
  req: Request,
  res: Response,
  paramArr: ParamType[] = [],
  parseArr: ParseType[] = [],
) {
  if (!paramArr.length) return [];

  const args = [];

  paramArr.forEach(param => {
    const { key, index, type } = param;
    // console.log(req.params, req.query);
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

  return args;
}

export default router;
