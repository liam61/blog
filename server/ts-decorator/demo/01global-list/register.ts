import { controllerList, routeList, paramList, parseList } from './decorators';
import { Express, Router } from 'express';
import { handlerFactory } from '../utils';

function register(rootPath: string, app: Express) {
  const router = Router();

  controllerList.forEach(controller => {
    const { path: basePath, target: cTarget } = controller;

    routeList
      .filter(
        ({ target, loaded }) =>
          !loaded && target === (cTarget as any).prototype,
      )
      .forEach(route => {
        route.loaded = true;
        const { name: funcName, type, path, func } = route;
        const handler = handlerFactory(
          func,
          paramList.filter(param => param.name === funcName),
          parseList.filter(parse => parse.name === funcName),
        );

        router[type](basePath + path, handler);
      });
  });

  app.use(rootPath, router);
}

export default register;
