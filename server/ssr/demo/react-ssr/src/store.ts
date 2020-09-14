import { observable, action } from 'mobx'
import { useStaticRendering } from 'mobx-react'

const isServer = typeof window === 'undefined'

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

  fetchName = async (name?: string) => {
    return new Promise(resolve =>
      // mock api
      setTimeout(() => resolve(name || Math.random().toString(36).slice(-8)), 500),
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

// observer without observe
useStaticRendering(isServer)
let store: Store | null = null

export default function initializeStore(initialState = {}) {
  if (isServer) return new Store(initialState)

  !store && (store = new Store(initialState))

  if (window.__INITIAL_STATE__) {
    store.update(window.__INITIAL_STATE__)
    window.__INITIAL_STATE__ = null
  }

  return store
}
