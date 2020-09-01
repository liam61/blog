import Foo from './components/Foo'
import Bar from './components/Bar/Loadable'
import { RouteProps } from 'react-router-dom'

export interface MyRoute extends RouteProps {
  id: string
}

const routes: MyRoute[] = [
  {
    id: 'index',
    path: '/',
    component: Foo,
    exact: true,
  },
  {
    id: 'bar',
    path: '/bar',
    component: Bar,
  },
]

export default routes
