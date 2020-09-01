import React from 'react'
import { render, hydrate } from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import { configure } from 'mobx'
import { Provider } from 'mobx-react'
import { loadableReady } from '@loadable/component'
import App from './App'
import initializeStore from './store'

const isDev = process.env.NODE_ENV === 'development'
const store = initializeStore()
const container = document.getElementById('app')

configure({ enforceActions: 'observed' })

if (isDev) {
  render(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    container,
  )
} else {
  loadableReady(() => {
    hydrate(
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>,
      container,
    )
  })
}
