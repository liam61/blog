import React, { useState } from 'react'

const Bar = () => {
  const [count, setCount] = useState(0)
  return <div onClick={() => setCount(count + 1)}>click Bar {count}</div>
}

export default Bar
