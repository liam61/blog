import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { getUser, getPermission } from '@/api'
import { co } from '@/utils/thenSync'

class PreloadAllPage extends Component<any, { loading: boolean; user: any; perm: any }> {
  state = {
    loading: true,
    user: {} as any,
    perm: {} as any,
  }

  componentWillMount() {
    co(this.request())
  }

  *request() {
    // 实际调用时可以不传参
    const [user, perm] = yield [getUser(), getPermission()]
    this.setState({ user, perm, loading: false })
  }

  render() {
    const { loading, user, perm } = this.state
    const { id, name, email, gender, age } = user
    const { permA, permB } = perm
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
            <View style={{ margin: '10px', fontWeight: 'bold' }}>perm info</View>
            <View>permA: {permA}</View>
            <View>permB: {permB}</View>
          </View>
        )}
      </View>
    )
  }
}

export default PreloadAllPage
