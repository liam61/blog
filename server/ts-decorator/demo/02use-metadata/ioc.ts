import IndexController from './controllers/index';
import UserController from './controllers/users';

export default {
  index: new IndexController(),
  user: new UserController(),
};
