import { wait, getBool } from '@/utils'
import { cache } from '@/utils/cache'
import { THEN_ALL, THEN_SYNC } from '@/utils/thenSync'

export const getUser = (id = '') => {
  const url = '/userInfo'
  const api = cache[url]
  if (api) {
    if (!api[THEN_ALL] && !api[THEN_SYNC]) {
      api[THEN_SYNC] = false
    }
    delete cache[url]
    return api
  }

  const bool = getBool()
  console.log('start load', url);
  const p = wait({
    id,
    name: `user-${id}`,
    email: `${id}@163.com`,
    gender: bool ? 'male' : 'female',
    age: bool ? 20 : 25,
  })
  ;(p as any).url = url
  return p
}

export const getPermission = () => {
  const url = '/userPermission'
  const api = cache[url]
  if (api) {
    if (!api[THEN_ALL] && !api[THEN_SYNC]) {
      api[THEN_SYNC] = false
    }
    delete cache[url]
    return api
  }

  console.log('start load', url);
  const p = wait({
    permA: getBool(),
    permB: getBool(),
  })
  ;(p as any).url = url
  return p
}

export const preloadApi = {
  '/pages/preload/index': [({ id }) => getUser(id)],
  '/pages/preloadAll/index': [({ id }) => getUser(id), () => getPermission()],
}
