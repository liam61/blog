import React from 'react'
import { observer, inject } from 'mobx-react'
import initializeStore, { Store } from '../store'
import loadable from '@loadable/component'

// child chunk
const Baz = loadable(() => import(/* webpackChunkName: "baz" */ './Baz'), {
  fallback: <h1>Loading...</h1>,
})

interface FooProps {
  store: Store
}

const Foo = ({ store }: FooProps) => {
  const handleClick = () => {
    store.changeNum()
    store.fetchName()
  }

  return (
    <div>
      Foo
      <button onClick={handleClick}>{`点击 ${store.num}`}</button>
      <p>{store.name}</p>
      <Baz />
    </div>
  )
}

Foo.getInitialProps = async _ctx => {
  // console.log(ctx)
  const store = initializeStore()
  await store.fetchName(process.env.RENDER_ENV === 'ssr' ? 'name-by-server' : 'name-by-client')
  return store.toJSON()
}

export default inject('store')(observer(Foo))
