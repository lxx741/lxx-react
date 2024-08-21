// 处理事件委托
import setupEventDelegation from './event'
// 导入工具函数
import { isUndefined, wrapToArray } from '../utils'
// 导入文本标识
import { REACT_TEXT } from '../constant'
// 创建根容器
function createRoot(container) {
  return {
    render(rootVdom) {
      // 把根虚拟节点挂载到容器中
      mountVdom(rootVdom, container)
      // 处理事件委托
      setupEventDelegation(container)
    },
  }
}
// 挂载虚拟节点到容器中
export function mountVdom(vdom, container) {
  const domElement = createDOMElement(vdom)
  if (domElement === null) return
  container.appendChild(domElement)
}
// 根据虚拟节点创建真实节点
export function createDOMElement(vdom) {
  if (isUndefined(vdom)) return null
  const { type } = vdom
  if (type === REACT_TEXT) {
    return createTextDOMElement(vdom)
  } else if (typeof type === 'function') {
    if (type.isReactComponent) {
      return createClassDOMElement(vdom)
    } else {
      return createFunctionDOMElement(vdom)
    }
  } else {
    return createNativeDOMElement(vdom)
  }
}
// 根据虚拟节点创建真实文本节点
function createTextDOMElement(vdom) {
  const { props } = vdom
  const domElement = document.createTextNode(props)
  // 将虚拟节点与真实节点对应起来，虚拟节点上的domElement属性存放着该虚拟节点对应的真实节点
  vdom.domElement = domElement
  return domElement
}
// 根据虚拟节点创建函数组件对应的真实节点
function createFunctionDOMElement(vdom) {
  const { type, props } = vdom
  const renderVdom = type(props)
  vdom.oldRenderVdom = renderVdom
  return createDOMElement(renderVdom)
}
// 根据虚拟节点创建类组件对应的真实节点
function createClassDOMElement(vdom) {
  const { type, props } = vdom
  const classInstance = new type(props)
  vdom.classInstance = classInstance
  const renderVdom = classInstance.render()
  classInstance.oldRenderVdom = renderVdom
  return createDOMElement(renderVdom)
}
// 根据虚拟节点创建原生节点
function createNativeDOMElement(vdom) {
  const { type, props } = vdom
  const domElement = document.createElement(type)
  updateProps(domElement, {}, props)
  mountChildren(vdom, domElement)
  // 虚拟节点与真实节点映射起来
  vdom.domElement = domElement
  return domElement
}
// 挂载后代节点
function mountChildren(vdom, container) {
  wrapToArray(vdom?.props?.children).forEach((child) =>
    mountVdom(child, container)
  )
}
// 更新节点属性
function updateProps(domElement, oldProps = {}, newProps = {}) {
  Object.keys(oldProps).forEach((name) => {
    if (!newProps.hasOwnProperty(name) || name === 'children') {
      if (name === 'style') {
        Object.keys(oldProps.style).forEach((styleProp) => {
          domElement.style[styleProp] = ''
        })
      } else if (name.startsWith('on')) {
        delete domElement.reactEvents[name]
      } else {
        delete domElement[name]
      }
    }
  })
  Object.keys(newProps).forEach((name) => {
    if (name === 'children') {
      return
    }
    if (name === 'style') {
      Object.assign(domElement.style, newProps.style)
    } else if (name.startsWith('on')) {
      ;(domElement.reactEvents || (domElement.reactEvents = {}))[name] =
        newProps[name]
    } else {
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
      return getDOMElementByVdom(vdom.classInstance.oldRenderVdom)
    } else {
      return getDOMElementByVdom(vdom.oldRenderVdom)
    }
  } else {
    return vdom.domElement
  }
}
const ReactDOM = {
  createRoot,
}
export default ReactDOM
