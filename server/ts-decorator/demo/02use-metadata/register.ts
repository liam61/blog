import { Express, Router } from 'express';
import {
  CONTROLLER_METADATA,
  ROUTE_METADATA,
  PARAM_METADATA,
  PARSE_METADATA,
} from './decorators';
import { RouteType, handlerFactory } from '../utils';

function register(
  controllerStore: Record<string, any>,
  rootPath: string,
  app: Express,
) {
  const router = Router();

  Object.values(controllerStore).forEach(instance => {
    const controllerMetadata: string = Reflect.getMetadata(
      CONTROLLER_METADATA,
      instance.constructor,
    );

    const proto = Object.getPrototypeOf(instance);
    const routeNameArr = Object.getOwnPropertyNames(proto).filter(
      n => n !== 'constructor' && typeof proto[n] === 'function',
    );

    routeNameArr.forEach(routeName => {
      const routeMetadata: RouteType = Reflect.getMetadata(
        ROUTE_METADATA,
        proto[routeName],
      );

      const { type, path } = routeMetadata;
      const handler = handlerFactory(
        proto[routeName],
        Reflect.getMetadata(PARAM_METADATA, instance, routeName),
        Reflect.getMetadata(PARSE_METADATA, instance, routeName),
      );

      router[type](controllerMetadata + path, handler);
    });
  });

  app.use(rootPath, router);
}

export default register;
