import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import Item, { ItemType } from './item'

interface CustomRenderProps {
  data: ItemType[]
  renderNormal: () => JSX.Element
}

export default class CustomRender extends Component<CustomRenderProps> {
  static defaultProps = {
    data: [],
  }

  render() {
    const { data } = this.props
    return (
      <View style='margin-top: 20px'>
        {data.map(item => {
          const { name, custom, onClick = () => {} } = item
          if (!custom) return <Item key={name} {...item} />
          return (
            <View key={name} onClick={onClick} style='margin-bottom: 10px'>
              <slot name={name} />
            </View>
          )
        })}
        {this.props.renderNormal()}
      </View>
    )
  }
}
