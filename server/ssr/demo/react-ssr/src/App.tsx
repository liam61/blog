import React from 'react'
import { Route, Link } from 'react-router-dom'
import routes from './routes'

const App = () => {
  return (
    <>
      <Link to='/'>Foo</Link>
      <Link to='/bar'>Bar</Link>
      {routes.map(({ id, ...route }) => (
        <Route key={id} {...route} />
      ))}
    </>
  )
}

export default App
