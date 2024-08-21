import { wrapToVdom } from './utils'
import { getDOMElementByVdom, compareVdom } from './react-dom/client'
import { FORWARD_REF } from './constant'
let isBatchingUpdates = false // 标识是否为批量更新
let dirtyComponents = new Set() // 待更新组件的集合
// 设置批量更新标识
export function setIsBatchingUpdates(value) {
  isBatchingUpdates = value
}
// 更新组件
export function flushDirtyComponents() {
  // 更新批量存储的组件
  dirtyComponents.forEach((component) => component.updateIfNeeded())
  // 清空集合
  dirtyComponents.clear()
  // 设置批量更新标识为false
  isBatchingUpdates = false
}
// 创建虚拟节点
function createElement(type, config, children) {
  let { ref, key, ...props } = config
  if (arguments.length > 3) {
    // 参数大于三个时，从第二个开始都为后代节点
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom)
  } else {
    // 否则将后代节点包装成对象格式
    props.children = wrapToVdom(children)
  }
  return {
    type,
    props,
    ref,
    key,
  }
}
// 基类组件
class Component {
  static isReactComponent = true // 判断继承该类的子类都组件，具有组件的特性
  constructor(props) {
    this.props = props
    this.pendingStates = [] // 存储批量更新的状态
  }
  // 设置状态
  setState(partialState) {
    if (isBatchingUpdates) {
      // 如果为批量更新状态时，先将组件和状态存储起来
      dirtyComponents.add(this)
      this.pendingStates.push(partialState)
    } else {
      // 设置状态时，可传递对象或函数
      const newState =
        typeof partialState === 'function'
          ? partialState(this.state) // 传入之前的状态，并调用函数
          : partialState // 是对象的话，直接返回
      // 生成新的状态
      this.state = {
        ...this.state,
        ...newState,
      }
      // 更新组件
      this.forceUpdate()
    }
  }
  // 根据状态集合计算最新的状态
  accumulateState() {
    let state = this.pendingStates.reduce((state, update) => {
      const newState = typeof update === 'function' ? update(state) : update
      return { ...state, ...newState }
    }, this.state)
    this.pendingStates.length = 0
    return state
  }
  //
  updateIfNeeded() {
    // 计算最新状态
    const nextState = this.accumulateState()
    // 是否需要更新
    const shouldUpdate = this.shouldComponentUpdate?.(this.nextProps, nextState)
    // 存储最新状态
    this.state = nextState
    // 设置属性
    if (this.nextProps) this.props = this.nextProps
    // 不需要更新直接返回
    if (shouldUpdate === false) return
    // 更新组件
    this.forceUpdate()
  }
  // 触发更新
  emitUpdate(nextProps) {
    this.nextProps = nextProps
    if (this.nextProps || this.pendingStates.length > 0) {
      // 属性或状态发生变化的话
      this.updateIfNeeded()
    }
  }
  //
  forceUpdate() {
    // 如果有生命周期函数componentWillUpdate则调用
    this.componentWillUpdate?.()
    // 调用render方法获取渲染的虚拟节点
    const renderVdom = this.render()
    // 根据上次的虚拟节点获取对应的真实节点
    const oldDOMElement = getDOMElementByVdom(this.oldRenderVdom)
    // 获取节点的父节点
    const parentDOM = oldDOMElement.parentNode
    // 对比前后两次的虚拟节点
    compareVdom(parentDOM, this.oldRenderVdom, renderVdom)
    // 将这次虚拟节点赋值给oldRenderVdom
    this.oldRenderVdom = renderVdom
    // 调用钩子函数
    this.componentDidUpdate?.(this.props, this.state)
  }
}
// 创建ref对象
function createRef() {
  return {
    current: null,
  }
}
// 通过forwardRef创建虚拟节点
function forwardRef(render) {
  return {
    $$typeof: FORWARD_REF,
    render,
  }
}
const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
}
export default React
