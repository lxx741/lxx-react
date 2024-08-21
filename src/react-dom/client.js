import setupEventDelegation from './event'
import { isUndefined, wrapToArray } from '../utils'
import { REACT_TEXT } from '../constant'

function createRoot(container) {
  return {
    render(rootVdom) {
      mountVdom(rootVdom, container)
      // 处理事件委托
      setupEventDelegation(container)
    },
  }
}
// 挂载虚拟节点
export function mountVdom(vdom, container) {
  // 根据虚拟节点创建真实节点
  const domElement = createDOMElement(vdom)
  if (domElement === null) return
  // 挂载虚拟节点到容器上
  container.appendChild(domElement)
}
// 根据虚拟节点创建真实节点
function createDOMElement(vdom) {
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
  // 将真实节点挂载到虚拟节点上
  vdom.domElement = domElement
  return domElement
}
// 根据虚拟节点创建函数组件的真实节点
function createFunctionDOMElement(vdom) {
  const { type, props } = vdom
  const renderVdom = type(props)
  return createDOMElement(renderVdom)
}
// 根据虚拟节点创建类组件的真实节点
function createClassDOMElement(vdom) {
  const { type, props } = vdom
  const classInstance = new type(props)
  const renderVdom = classInstance.render()
  debugger
  return createDOMElement(renderVdom)
}
// 根据虚拟节点创建原生组件的真实节点
function createNativeDOMElement(vdom) {
  const { type, props } = vdom
  const domElement = document.createElement(type)
  updateProps(domElement, {}, props)
  mountChildren(vdom, domElement)
  return domElement
}
// 挂载后代节点
function mountChildren(vdom, container) {
  wrapToArray(vdom?.props?.children).forEach((child) =>
    mountVdom(child, container)
  )
}
// 更新真实节点的属性，包括样式、事件等
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
const ReactDOM = {
  createRoot,
}
export default ReactDOM
