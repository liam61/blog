import Taro, { Component } from '@tarojs/taro'
import { View, Button, Radio, RadioGroup, Text } from '@tarojs/components'
import { ComponentType } from 'react'
import CustomRender from '@/components/custom-render'
import lottie from 'lottie-miniprogram'
import toast from '@/utils/toast'
import $history from '@/utils/history'
import { getUid } from '@/utils'

class Index extends Component<any, { radio: string }> {
  state = {
    radio: 'male',
  }

  initedLoading = false

  createLoading = () => {
    if (this.initedLoading) return
    wx.createSelectorQuery()
      .selectAll('#loading')
      .node(([res]) => {
        const canvas = res.node
        const context = canvas.getContext('2d')
        canvas.width = 100
        canvas.height = 100
        lottie.setup(canvas)
        lottie.loadAnimation({
          loop: true,
          autoplay: true,
          animationData: require('./loading.json'),
          rendererSettings: { context },
        })
      })
      .exec()
    this.initedLoading = true
  }

  goPreloadPage = (force = true) => {
    $history.go('/pages/preload/index', { query: { id: getUid(), force } })
  }

  goPreloadAllPage = () => {
    $history.go('/pages/preloadAll/index', { query: { id: getUid() } })
  }

  render() {
    const { radio } = this.state

    return (
      <View className='index'>
        <Button onClick={() => toast.success('成功提交请求')}>click to open success toast</Button>
        <Button onClick={() => toast.error('请求发送失败')}>click to open error toast</Button>
        <Button onClick={() => toast.hide()}>click to hide toast</Button>
        <Button onClick={this.createLoading}>click to create loading</Button>
        <CustomRender
          data={[
            {
              name: 'name',
              label: '姓名(click item)',
              value: 'lawler',
              required: true,
              onClick: () => toast.info('you click name item'),
            },
            {
              name: 'password',
              label: '密码',
              value: 'pwd...',
              required: true,
            },
            {
              name: 'age',
              label: '年龄',
              value: 18,
            },
            {
              name: 'gender',
              custom: true,
              onClick: () => toast.info('you change gender item'),
            },
          ]}
          renderNormal={() => <View>this is normal render prop</View>}
        >
          <view slot='gender'>
            <View style='display: flex'>
              <Text>性别：</Text>
              <RadioGroup
                onChange={() => this.setState({ radio: radio === 'male' ? 'female' : 'male' })}
              >
                <Radio checked={radio === 'male'} style='margin-right: 40px'>
                  男
                </Radio>
                <Radio checked={radio === 'female'}>女</Radio>
              </RadioGroup>
            </View>
          </view>
        </CustomRender>
        <Button onClick={() => this.goPreloadPage(true)}>go page without preload</Button>
        <Button onClick={() => this.goPreloadPage(false)}>go preload page</Button>
        <Button onClick={this.goPreloadAllPage}>go preloadAll page</Button>
      </View>
    )
  }
}

export default Index as ComponentType
