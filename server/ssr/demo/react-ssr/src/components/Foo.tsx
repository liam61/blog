import React from 'react'
import { observer, inject } from 'mobx-react'
import initializeStore, { Store } from '../store'

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
    </div>
  )
}

Foo.getInitialProps = async _ctx => {
  // console.log(ctx)
  const store = initializeStore()
  await store.fetchName()
  return store.toJSON()
}

export default inject('store')(observer(Foo))
