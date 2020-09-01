import { matchPath } from 'react-router-dom'
// import createApp from './main'
import routes from './routes'
import App from './App'

// called in server
export default ctx => {
  return new Promise((resolve, reject) => {
    const matches = routes
      .filter(route => matchPath(ctx.url, route))
      .map(route => route.component || route.render)

    if (!matches.length) {
      throw new Error('no Component match')
    }

    Promise.all(
      matches.map(
        (Cmp: any) => typeof Cmp.getInitialProps === 'function' && Cmp.getInitialProps(ctx),
      ),
    ).then(states => {
      ctx.state = states.reduce((obj, state) => Object.assign(obj, state), {})
      resolve(App)
    })
  })
}
