// 创建根容器
function createRoot(container) {
  return {
    render(reactElement) {
      const domElement = renderElement(reactElement)
      container.appendChild(domElement)
    },
  }
}
// 转换虚拟节点成真实节点
function renderElement(element) {
  // 处理文本节点
  if (typeof element === 'string') {
    return document.createTextNode(element)
  }
  // 处理原生节点
  // 结构体系类型和属性
  const { type, props } = element
  // 创建原生节点
  const domElement = document.createElement(type)
  // 处理原生节点的属性
  Object.keys(props).forEach((name) => {
    // 排除children
    if (name === 'children') {
      return
    }
    if (name === 'style') {
      // 处理样式
      Object.assign(domElement.style, props.style)
    } else if (name.startsWith('on')) {
      // 处理事件
      const eventName = name.toLowerCase().substring(2)
      domElement.addEventListener(eventName, props[name])
    } else {
      // 处理一般属性
      domElement[name] = props[name]
    }
  })
  // 将后代统一处理成数组格式
  if (typeof props.children !== 'undefined') {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children]
    // 递归处理后代节点
    children.forEach((child) => domElement.appendChild(renderElement(child)))
  }
  // 返回虚拟树对应的真实树
  return domElement
}
const ReactDOMClient = {
  createRoot,
}
export default ReactDOMClient
