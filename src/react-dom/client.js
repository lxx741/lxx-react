import setupEventDelegation from './event'
import { isDefined, isUndefined, wrapToArray } from '../utils'
import { REACT_TEXT, FORWARD_REF } from '../constant'
// 根据根容器创建根节点
function createRoot(container) {
  return {
    render(rootVdom) {
      // 将虚拟节点挂载到容器上
      mountVdom(rootVdom, container)
      // 设置事件委托
      setupEventDelegation(container)
    },
  }
}
// 挂载虚拟节点
export function mountVdom(vdom, container) {
  // 根据虚拟节点创建真实节点
  const domElement = createDOMElement(vdom)
  if (domElement === null) return
  // 将真实节点插入容器
  container.appendChild(domElement)
  // 调用componentDidMount钩子函数
  domElement?.componentDidMount?.()
}
export function createReactForwardDOMElement(vdom) {
  const { type, props, ref } = vdom
  // 根据forwardRef传入的render参数，获取渲染的虚拟节点
  const renderVdom = type.render(props, ref)
  vdom.oldRenderVdom = renderVdom
  return createDOMElement(renderVdom)
}
// 根据虚拟节点创建真实节点
export function createDOMElement(vdom) {
  if (isUndefined(vdom)) return null
  const { type } = vdom
  if (type.$$typeof === FORWARD_REF) {
    // forwardRef 组件
    return createReactForwardDOMElement(vdom)
  } else if (type === REACT_TEXT) {
    // 文本组件
    return createTextDOMElement(vdom)
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      // 类组件
      return createClassDOMElement(vdom)
    } else {
      // 函数组件
      return createFunctionDOMElement(vdom)
    }
  } else {
    // 原生组件
    return createNativeDOMElement(vdom)
  }
}
// 创建文本节点
function createTextDOMElement(vdom) {
  const { props } = vdom
  const domElement = document.createTextNode(props)
  // 在虚拟节点上记录真实节点，虚拟节点与真实节点对应
  vdom.domElement = domElement
  return domElement
}
// 创建函数组件的真实节点
function createFunctionDOMElement(vdom) {
  const { type, props } = vdom
  const renderVdom = type(props)
  vdom.oldRenderVdom = renderVdom
  return createDOMElement(renderVdom)
}
// 创建类组件的真实节点
function createClassDOMElement(vdom) {
  const { type, props, ref } = vdom
  const classInstance = new type(props) // 创建类的实例
  classInstance.componentWillMount?.() // 调用钩子函数
  vdom.classInstance = classInstance // 在虚拟节点上记录类组件的实例
  if (ref) ref.current = classInstance // 给类组件的ref对象的current属性赋值成实例
  const renderVdom = classInstance.render() // 获取类组件的渲染虚拟节点
  classInstance.oldRenderVdom = renderVdom // 记录渲染的虚拟节点
  const domElement = createDOMElement(renderVdom) // 创建真实节点
  if (typeof classInstance.componentDidMount === 'function') {
    // 指定 componentDidMount 中的 this 指向为实例对象
    domElement.componentDidMount =
      classInstance.componentDidMount.bind(classInstance)
  }
  return domElement
}
// 创建原生节点
function createNativeDOMElement(vdom) {
  const { type, props, ref } = vdom
  const domElement = document.createElement(type)
  if (ref) {
    ref.current = domElement // 给ref.current属性赋值为原生节点
  }
  updateProps(domElement, {}, props) // 更新属性
  mountChildren(vdom, domElement) // 挂载儿子
  vdom.domElement = domElement // 映射虚拟节点和真实节点
  return domElement
}
// 挂载儿子
function mountChildren(vdom, container) {
  wrapToArray(vdom?.props?.children).forEach((child) =>
    mountVdom(child, container)
  )
}
// 更新属性
function updateProps(domElement, oldProps = {}, newProps = {}) {
  // 循环旧属性
  Object.keys(oldProps).forEach((name) => {
    // 有旧属性，没新属性
    if (!newProps.hasOwnProperty(name) || name === 'children') {
      if (name === 'style') {
        // 清空样式
        Object.keys(oldProps.style).forEach((styleProp) => {
          domElement.style[styleProp] = ''
        })
      } else if (name.startsWith('on')) {
        // 删除事件
        delete domElement.reactEvents[name]
      } else {
        // 删除一般属性
        delete domElement[name]
      }
    }
  })
  // 处理新属性
  Object.keys(newProps).forEach((name) => {
    if (name === 'children') {
      return
    }
    if (name === 'style') {
      // 合并样式
      Object.assign(domElement.style, newProps.style)
    } else if (name.startsWith('on')) {
      // 添加事件
      ;(domElement.reactEvents || (domElement.reactEvents = {}))[name] =
        newProps[name]
    } else {
      // 添加一般属性
      domElement[name] = newProps[name]
    }
  })
}
// 根据虚拟节点获取对应的真实节点
export function getDOMElementByVdom(vdom) {
  if (isUndefined(vdom)) return null
  let { type } = vdom
  if (typeof type === 'function') {
    if (type.isReactComponent) {
      // 类组件的虚拟节点在实例上
      return getDOMElementByVdom(vdom.classInstance.oldRenderVdom)
    } else {
      // 函数组件
      return getDOMElementByVdom(vdom.oldRenderVdom)
    }
  } else {
    return vdom.domElement
  }
}
// 更新文本节点
function updateReactTextComponent(oldVdom, newVdom) {
  let domElement = (newVdom.domElement = getDOMElementByVdom(oldVdom))
  if (oldVdom.props !== newVdom.props) {
    domElement.textContent = newVdom.props
  }
}
// 更新类组件
function updateClassComponent(oldVdom, newVdom) {
  let classInstance = (newVdom.classInstance = oldVdom.classInstance) // 复用实例
  classInstance.componentWillReceiveProps?.(newVdom.props)
  classInstance.emitUpdate(newVdom.props)
}
// 更新原生组件
function updateNativeComponent(oldVdom, newVdom) {
  let domElement = (newVdom.domElement = getDOMElementByVdom(oldVdom))
  // 更新属性
  updateProps(domElement, oldVdom.props, newVdom.props)
  // 更新儿子
  updateChildren(domElement, oldVdom.props.children, newVdom.props.children)
}
// 判断是否是相同节点
function isSameVnode(oldVnode, newVnode) {
  return (
    oldVnode &&
    newVnode &&
    oldVnode.type === newVnode.type &&
    oldVnode.key === newVnode.key
  )
}
// 更新儿子
function updateChildren(parentDOM, oldVChildren, newVChildren) {
  // 格式化儿子
  oldVChildren = wrapToArray(oldVChildren)
  newVChildren = wrapToArray(newVChildren)
  let lastPlaceNode = null
  for (let index = 0; index < newVChildren.length; index++) {
    const newChild = newVChildren[index] // 新节点
    if (!newChild) continue
    // 旧节点的索引
    const oldChildIndex = oldVChildren.findIndex((oldChild) =>
      isSameVnode(oldChild, newChild)
    )
    const oldChild = oldVChildren[oldChildIndex] // 旧节点
    if (oldChild) {
      // 旧节点在更新
      updateVdom(oldChild, newChild)
      const oldDOMElement = getDOMElementByVdom(oldChild)
      if (isDefined(lastPlaceNode)) {
        if (lastPlaceNode.nextSibling !== oldDOMElement) {
          // 插过，继续插入前一个的后面
          parentDOM.insertBefore(oldDOMElement, lastPlaceNode.nextSibling)
        }
      } else {
        // 没插过，从第一个开始
        parentDOM.insertBefore(oldDOMElement, parentDOM.firstChild)
      }
      lastPlaceNode = oldDOMElement // 记录插过的节点
      oldVChildren.splice(oldChildIndex, 1) // 删除复用的节点
    } else {
      // 旧节点不存在，创建新的
      const newDOMELement = createDOMElement(newChild)
      if (isDefined(lastPlaceNode)) {
        // 插过，插到前一个的后面
        parentDOM.insertBefore(newDOMELement, lastPlaceNode.nextSibling)
      } else {
        // 没插过，从第一个开始
        parentDOM.insertBefore(newDOMELement, parentDOM.firstChild)
      }
      lastPlaceNode = newDOMELement // 记录插过的节点
    }
  }
  //
  oldVChildren.forEach((oldChild) => getDOMElementByVdom(oldChild)?.remove())
}
// 更新函数组件
function updateFunctionComponent(oldVdom, newVdom) {
  let { type, props } = newVdom
  let newRenderVdom = type(props)
  compareVdom(
    getDOMElementByVdom(oldVdom).parentNode, // 获取旧虚拟节点对应的真实节点的父节点
    oldVdom.oldRenderVdom, // 旧虚拟节点的渲染节点
    newRenderVdom // 新渲染节点
  )
  newVdom.oldRenderVdom = newRenderVdom // 本次的渲染节点成为旧渲染节点
}
// 更新forwardRef组件
function updateReactForwardComponent(oldVdom, newVdom) {
  let { type, props, ref } = newVdom
  let renderVdom = type.render(props, ref)
  compareVdom(
    getDOMElementByVdom(oldVdom).parentNode,
    oldVdom.oldRenderVdom,
    renderVdom
  )
  newVdom.oldRenderVdom = renderVdom
}
// 更新虚拟节点
function updateVdom(oldVdom, newVdom) {
  if (oldVdom.type.$$typeof === FORWARD_REF) {
    // 更新forwardRef组件
    return updateReactForwardComponent(oldVdom, newVdom)
  } else if (oldVdom.type === REACT_TEXT) {
    // 更新文本节点
    return updateReactTextComponent(oldVdom, newVdom)
  } else if (typeof oldVdom.type === 'string') {
    // 更新原生组件
    return updateNativeComponent(oldVdom, newVdom)
  } else if (typeof oldVdom.type === 'function') {
    if (oldVdom.type.isReactComponent) {
      // 更新类组件
      updateClassComponent(oldVdom, newVdom)
    } else {
      // 更新函数组件
      updateFunctionComponent(oldVdom, newVdom)
    }
  }
}
// 卸载虚拟节点
function unMountVdom(vdom) {
  if (!vdom) return
  let { props, ref } = vdom
  let domElement = getDOMElementByVdom(vdom)
  vdom?.classInstance?.componentWillUnmount()
  if (ref) {
    ref.current = null
  }
  wrapToArray(props.children).forEach(unMountVdom) // 递归卸载儿子
  domElement?.remove()
}
// 比较虚拟节点
export function compareVdom(parentDOM, oldVdom, newVdom, nextDOMElement) {
  if (!oldVdom && !newVdom) {
    return
  } else if (!!oldVdom && !newVdom) {
    // 有旧的，没新的，卸载
    unMountVdom(oldVdom)
  } else if (!oldVdom && !!newVdom) {
    // 没旧的，有新的，创建
    let newDOMElement = createDOMElement(newVdom)
    if (nextDOMElement) parentDOM.insertBefore(newDOMElement, nextDOMElement)
    else parentDOM.appendChild(newDOMElement)
    newDOMElement?.componentDidMount?.()
  } else if (!!oldVdom && !!newVdom && oldVdom.type !== newVdom.type) {
    // 有旧的，有新的，不一样，创建新的，卸载旧的
    let newDOMElement = createDOMElement(newVdom)
    unMountVdom(oldVdom)
    newDOMElement?.componentDidMount?.()
  } else {
    // 有旧的，有新的，一样，更新
    updateVdom(oldVdom, newVdom)
  }
}
const ReactDOM = {
  createRoot,
}
export default ReactDOM
