import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import controllerStore from './ioc';
import register from './register';

export default function() {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  register(controllerStore, '/', app);

  app.listen(8080, () =>
    console.log('server is running at http://localhost:8080'),
  );
}
