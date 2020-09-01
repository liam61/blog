import { observable, action } from 'mobx'
import { useStaticRendering } from 'mobx-react'

const isServer = typeof window === 'undefined'
useStaticRendering(isServer)

export class Store {
  @observable num = 0
  @observable name = 'no-name'

  constructor(initialState: Partial<Store>) {
    this.update(initialState)
  }

  @action
  update = (obj: Partial<Store>) => {
    Object.entries(obj).forEach(([k, v]) => {
      this[k] = v
    })
  }

  @action
  changeNum = () => {
    this.num += 1
  }

  fetchName = async () => {
    return new Promise(resolve =>
      // mock api
      setTimeout(
        () => resolve(isServer ? 'name-by-server' : Math.random().toString(36).slice(-8)),
        500,
      ),
    ).then(
      action((name: string) => {
        this.name = name
      }),
    )
  }

  toJSON = () => {
    return {
      num: this.num,
      name: this.name,
    }
  }
}

let store: Store | null = null

export default function initializeStore(initialState = {}) {
  const instance = new Store(initialState)
  if (isServer) return instance

  !store && (store = instance)
  if (!isServer && window.__INITIAL_STATE__) {
    store.update(window.__INITIAL_STATE__)
  }

  return store
}
