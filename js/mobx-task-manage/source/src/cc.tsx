import React from 'react'
import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { computed, observable } from 'mobx'
import Loadx, { LoadxStore } from './loadx'
import { wait } from './loadx/utils'

// eslint-disable-next-line
@inject(() => ({ store: new Store() }))
@observer
export default class CC extends Component<{
  store?: LoadxStore<Store>
}> {
  UNSAFE_componentWillMount() {
    this.props.store!.getDelayData()
  }

  render() {
    const {
      loading,
      delayLoading,
      type,
      user,
      changeAll,
      changeUser, // check my type
    } = this.props.store!
    return (
      <div>
        <div>{`loading: ${loading}, type: ${type}, usename: ${user.name}`}</div>
        <div>{`delayLoading: ${delayLoading}`}</div>
        <button onClick={() => changeAll(2)}>{loading ? 'loading' : 'CC loadx store'}</button>
      </div>
    )
  }
}

class Store {
  loadx = new Loadx()
  loadxDelay = new Loadx({ preload: 1000 })

  @observable process = 'none'
  @observable type = 0
  @observable user = {
    name: 'lawler',
    age: 18,
  }
  @observable gender = 'male'

  @computed
  get loading() {
    return this.loadx.loading
  }

  @computed
  get delayLoading() {
    return this.loadxDelay.loading
  }

  // NOTE: 1. 使用函数 bind
  changeGender = this.loadx.bind(this._changeGender, /* { LoadxActionParams }, */ this)

  getDelayData = this.loadxDelay.bind(this._getDelayData, this)

  // NOTE: 2. 使用 decorator
  @Loadx.action
  changeAll = async (type: number) => {
    // 已被 action 包裹，可在请求前改变某些 prop
    this.process = 'changing'
    console.log({ progress: this.process })
    // 自定义是否 observe loading
    // this.loadx.setConfig({ observe: false })

    const res = await wait(200, { type })
    // const res = await wait(1000, Promise.reject('error in changing type'))

    // 可继续 await 另一个 Loadx.action
    await this.changeUser({ name: 'bb', age: 20 })

    // 也可把结果放到这里来
    const genderRes = await this.changeGender('female')

    // 多个请求只会 rerender 一次
    return () => {
      this.type = res.type
      this.process = 'none'
      this.gender = genderRes
      console.log({
        type: this.type,
        process: this.process,
        userName: this.user.name,
        gender: this.gender,
      })
    }
  }

  // NOTE: 3. 使用 decorator 传参
  @Loadx.action({
    // loadx?: 'loadx', 如果 store 只有一个 Loadx 可以不传，如果有多个则按需传 Loadx name
    onError(this: Store, _err) {
      this.process = 'none'
      console.log('onError', { progress: this.process })
    },
    onComplete(_resOrErr) {},
  })
  async changeUser(user: { name: string; age: number }) {
    // const res = await wait(500, Promise.reject('error in changing name'))
    const res = await wait(600, user)
    return () => {
      this.user = res

      return res
    }
  }

  async _changeGender(gender: string) {
    const res = await wait(400, gender)
    return res
    // return () => res
  }

  async _getDelayData() {
    const res = await wait(800, 'test delaydata')
    console.log(res)
    // return res
    return () => res
  }
}
