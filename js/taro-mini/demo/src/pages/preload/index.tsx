import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { getUser } from '@/api'
import { timer } from '@/utils'

class PreloadPage extends Component<any, { loading: boolean; user: any }> {
  state = {
    loading: true,
    user: {} as any,
  }

  componentWillMount() {
    const end = Date.now()
    console.log('willMount 正式调用 api：', end, '时间差：', end - timer.start, 'ms')
    this.request()
  }

  request = async () => {
    // 实际调用时可以不传参
    const user = await getUser()
    this.setState({ user, loading: false })
  }

  render() {
    const { loading, user } = this.state
    const { id, name, email, gender, age } = user
    console.log('render, loading:', loading)
    return (
      <View style={{ margin: '50px', textAlign: 'center' }}>
        {loading ? (
          <View>loading...</View>
        ) : (
          <View>
            <View style={{ margin: '10px', fontWeight: 'bold' }}>normal info</View>
            <View>id: {id}</View>
            <View>name: {name}</View>
            <View>email: {email}</View>
            <View>gender: {gender}</View>
            <View>age: {age}</View>
          </View>
        )}
      </View>
    )
  }
}

export default PreloadPage
