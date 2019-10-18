import * as Express from 'express';
import * as bodyParser from 'body-parser';
import './controllers/index';
import './controllers/users';
import router from './register';

export default function demo() {
  // @ts-ignore
  const app = new Express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use('/', router);

  app.listen(8080, () => console.log('server run as http://localhost:8080'));
}
