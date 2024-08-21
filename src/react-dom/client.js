function createRoot(container) {
  return {
    render(reactElement) {
      container.innerHTML = ''
      const domElement = renderElement(reactElement)
      container.appendChild(domElement)
    },
  }
}

function renderElement(element) {
  if (typeof element === 'string') {
    return document.createTextNode(element)
  }
  const { type, props } = element
  if (typeof type === 'function') {
    if (type.isReactComponent) {
      // 类组件
      const classInstance = new type(props)
      const classElement = classInstance.render()
      return renderElement(classElement)
    } else {
      // 函数组件
      const functionElement = type(props)
      return renderElement(functionElement)
    }
  }
  const domElement = document.createElement(type)
  Object.keys(props).forEach((name) => {
    if (name === 'children') {
      return
    }
    if (name === 'style') {
      Object.assign(domElement.style, props.style)
    } else if (name.startsWith('on')) {
      const eventName = name.toLowerCase().substring(2)
      domElement.addEventListener(eventName, props[name])
    } else {
      domElement[name] = props[name]
    }
  })
  if (typeof props.children !== 'undefined') {
    const children = Array.isArray(props.children)
      ? props.children
      : [props.children]
    children.forEach((child) => domElement.appendChild(renderElement(child)))
  }
  return domElement
}
const ReactDOMClient = {
  createRoot,
}
export default ReactDOMClient
