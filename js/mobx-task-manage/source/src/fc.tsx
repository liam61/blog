import * as React from 'react'
import { useObserver, observer } from 'mobx-react'
import { useLoadx } from './loadx'
import { wait } from './loadx/utils'

const Fc = () => {
  const { store, loading, bind } = useLoadx(
    () => ({
      data: { name: 'initdata', age: 0 },
      // computed value
      get dblAge() {
        return this.data.age * 2
      },
    }),
    { preload: true },
  )

  const getDataWithLoading = bind(async () => {
    const random = ~~(Math.random() * 20) + 1
    const res = await wait(1000, { name: `user${random}`, age: random })
    return () => {
      store.data = res
    }
  })

  const { data, dblAge } = store

  return useObserver(() => (
    <div style={{ marginTop: 100 }}>
      <div>{`loading: ${loading}, data: ${data.name}-${data.age}, compute prop: ${dblAge}`}</div>
      <button onClick={getDataWithLoading}>{loading ? 'loading' : 'FC loadx'}</button>
    </div>
  ))
}

export default observer(Fc)
