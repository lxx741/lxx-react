import { wrapToVdom } from './utils'
import { FORWARD_REF } from './constant'
import { getDOMElementByVdom, createDOMElement } from './react-dom/client'
// 默认不是批量更新
let isBatchingUpdates = false
// 脏组件
let dirtyComponents = new Set()
// 设置为批量更新
export function setIsBatchingUpdates(value) {
  isBatchingUpdates = value
}
// 刷新脏组件（即用最新的状态进行渲染）
export function flushDirtyComponents() {
  dirtyComponents.forEach((component) => component.forceUpdate())
  dirtyComponents.clear()
  isBatchingUpdates = false
}
function createElement(type, config, children) {
  let { ref, ...props } = config
  if (arguments.length > 3) {
    props.children = Array.prototype.slice.call(arguments, 2).map(wrapToVdom)
  } else {
    props.children = wrapToVdom(children)
  }
  return {
    ref,
    type,
    props,
  }
}
class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.pendingStates = []
  }
  // 重新设置状态
  // 参数可以是一个对象或函数
  setState(partialState) {
    // 如果是批量更新状态，则先把组件和状态存起来
    // react管理下的事件触发状态的更新，先把组件和状态存起来，等所有事件调用完毕后，再进行状态的更新和重新渲染
    if (isBatchingUpdates) {
      dirtyComponents.add(this)
      this.pendingStates.push(partialState)
    } else {
      const newState =
        typeof partialState === 'function'
          ? partialState(this.state)
          : partialState
      this.state = {
        ...this.state,
        ...newState,
      }
      this.forceUpdate()
    }
  }
  // 统一计算一次状态
  accumulateState() {
    let state = this.pendingStates.reduce((state, update) => {
      const newState = typeof update === 'function' ? update(state) : update
      return { ...state, ...newState }
    }, this.state)
    this.pendingStates.length = 0
    return state
  }
  forceUpdate() {
    // 更新前先计算一次最终状态
    this.state = this.accumulateState()
    // 获取待渲染的UI（虚拟节点）
    const renderVdom = this.render()
    // 获取老的真实节点
    const oldDOMElement = getDOMElementByVdom(this.oldRenderVdom)
    // 获取老节点的父节点
    const parentDOM = oldDOMElement.parentNode
    // 根据新的虚拟节点创建真实节点
    const newDOMElement = createDOMElement(renderVdom)
    // 用新节点替换老节点
    parentDOM.replaceChild(newDOMElement, oldDOMElement)
    // 新的虚拟节点变成老虚拟节点
    this.oldRenderVdom = renderVdom
  }
}

// 创建ref引用
function createRef() {
  return {
    current: null,
  }
}

// 根据render函数，创建虚拟节点
function forwardRef(render) {
  return {
    $$typeof: FORWARD_REF, // 类型标识
    render, // 渲染函数
  }
}
const React = {
  createElement,
  Component,
  createRef,
  forwardRef,
}
export default React
