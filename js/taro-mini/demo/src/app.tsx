import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import Index from './pages/index'
import toast from '@/utils/toast'
import $page from '@/utils/page'

import './components/toast/index.wxss'
import './components/loading/index.wxss'

class App extends Component {
  config: Config = {
    pages: ['pages/index/index', 'pages/preload/index', 'pages/preloadAll/index'],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
    },
  }

  componentWillMount() {
    toast.create()

    // 设置路由改变回调
    wx.onAppRoute((_res: any) => {
      toast.hide()
      $page.update()
    })
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
