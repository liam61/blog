import * as express from 'express';
import * as bodyParser from 'body-parser';
import './controllers/index';
import './controllers/users';
import register from './register';

export default function demo() {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  register('/', app);

  app.listen(8081, () =>
    console.log('server is running at http://localhost:8081'),
  );
}
