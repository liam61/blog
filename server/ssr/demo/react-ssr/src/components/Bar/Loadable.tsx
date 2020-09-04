import React from 'react'
import loadable from '@loadable/component'

const BarAsync = loadable(
  () => import(/* webpackChunkName: "bar", webpackPrefetch: true */ './index'),
  {
    fallback: <h1>Loading...</h1>,
  },
)

export default BarAsync
