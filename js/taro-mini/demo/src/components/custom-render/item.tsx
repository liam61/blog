import Taro from '@tarojs/taro'
import { View } from '@tarojs/components'
import { ITouchEvent } from '@tarojs/components/types/common'

export interface ItemType {
  name: string
  label?: string
  value?: string | number
  required?: boolean
  custom?: boolean
  onClick?: (event: ITouchEvent) => void
}

const Item = (props: ItemType) => {
  const { label, value, required, onClick = () => {} } = props
  return (
    <View onClick={onClick} style='margin-bottom:10px'>{`${label}：${value} and is ${
      required ? '' : 'not'
    } required`}</View>
  )
}

export default Item
