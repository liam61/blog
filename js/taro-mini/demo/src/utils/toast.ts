import Taro from '@tarojs/taro'
import successIcon from '@/images/success.svg'
import errorIcon from '@/images/error.svg'
import $page from './page'

const iconFactory = {
  success: successIcon,
  error: errorIcon,
  // loading
}

export type ToastIcon = 'success' | 'loading' | 'error' | 'none'

export interface ToastConfig {
  title: string
  icon?: ToastIcon // 可自定义 icon
  during?: number
  onShow?: () => void
  onHide?: () => void
}

export interface ToastProps {
  during?: number
}

class Toast {
  static instance: Toast

  page: Taro.Page
  visible = false
  during: number
  timer: any

  constructor(config?: ToastProps) {
    const { during } = config || {}
    this.during = during || 2500
  }

  static create(config?: ToastProps) {
    if (!this.instance) this.instance = new Toast(config)
    return this.instance
  }

  /**
   * 自定义调用
   */
  static async show(config: ToastConfig) {
    if (this.instance.visible) return
    this.instance.visible = true

    const { title, during = this.instance.during, icon = 'none', onShow } = config

    $page.setData('__toast__', {
      visible: true,
      title,
      icon: iconFactory[icon] || icon,
    })

    this.instance.timer = setTimeout(() => {
      this.hide()
    }, during)

    onShow && onShow()
  }

  static success(title: string, during?: number, config?: Omit<ToastConfig, 'title' | 'during'>) {
    return Toast.show({ title, during, ...Object.assign({}, config, { icon: 'success' }) })
  }

  static error(title: string, during?: number, config?: Omit<ToastConfig, 'title' | 'during'>) {
    return Toast.show({ title, during, ...Object.assign({}, config, { icon: 'error' }) })
  }

  static info(title: string, during?: number, config?: Omit<ToastConfig, 'title' | 'during'>) {
    return Toast.show({ title, during, ...Object.assign({}, config, { icon: 'none' }) })
  }

  static async hide(config?: Pick<ToastConfig, 'onHide'>) {
    if (!this.instance.visible) return
    if (this.instance.timer) {
      clearTimeout(this.instance.timer)
    }

    const { onHide } = config || {}
    $page.setData('__toast__', {
      visible: false,
    })
    this.instance.visible = false
    onHide && onHide()
  }
}

const toast = Toast

export default toast // 引用提示
