import React, { useEffect } from 'react'
import { render, hydrate } from 'react-dom'
import { BrowserRouter, useLocation, useRouteMatch } from 'react-router-dom'
import { configure } from 'mobx'
import { Provider } from 'mobx-react'
import { loadableReady } from '@loadable/component'
import App from './App'
import initializeStore from './store'
import routes from './routes'

const isSSR = process.env.RENDER_ENV === 'ssr'
const store = initializeStore()
const container = document.getElementById('app')

configure({ enforceActions: 'observed' })

const _App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>{isSSR ? <App /> : <AppClient />}</BrowserRouter>
    </Provider>
  )
}

const AppClient = () => {
  const location = useLocation()
  const matches = routes
    .filter(route => useRouteMatch(route))
    .map(route => route.component || route.render)

  // matches.length === 0 -> 404

  Promise.all(
    matches.map(
      (Cmp: any) => typeof Cmp.getInitialProps === 'function' && Cmp.getInitialProps(store),
    ),
  ).then(states => {
    const state = states.reduce((obj, state) => Object.assign(obj, state), {})
    store.update(state)
  })

  useEffect(() => {
    console.log('router change')
  }, [location])

  return <App />
}

if (isSSR) {
  loadableReady(() => hydrate(<_App />, container))
} else {
  render(<_App />, container)
}
