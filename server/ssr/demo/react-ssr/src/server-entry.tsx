import React from 'react'
import { matchPath, StaticRouter } from 'react-router-dom'
import { Provider } from 'mobx-react'
import App from './App'
import routes from './routes'

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
      const state = states.reduce((obj, state) => Object.assign(obj, state), {})
      const _App = () => (
        <Provider store={state}>
          <StaticRouter location={ctx.url}>
            <App />
          </StaticRouter>
        </Provider>
      )

      resolve({
        App: _App,
        state,
      })
    })
  })
}
