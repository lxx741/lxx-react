import { wrapToVdom } from './utils'
import { getDOMElementByVdom, createDOMElement } from './react-dom/client'
import { FORWARD_REF } from './constant'
let isBatchingUpdates = false
let dirtyComponents = new Set()
export function setIsBatchingUpdates(value) {
  isBatchingUpdates = value
}
export function flushDirtyComponents() {
  dirtyComponents.forEach((component) => component.updateIfNeeded())
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
    type,
    props,
    ref,
  }
}
class Component {
  static isReactComponent = true
  constructor(props) {
    this.props = props
    this.pendingStates = []
  }
  setState(partialState) {
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
  accumulateState() {
    let state = this.pendingStates.reduce((state, update) => {
      const newState = typeof update === 'function' ? update(state) : update
      return { ...state, ...newState }
    }, this.state)
    this.pendingStates.length = 0
    return state
  }
  updateIfNeeded() {
    const nextState = this.accumulateState()
    const shouldUpdate = this.shouldComponentUpdate?.(this.nextProps, nextState)
    this.state = nextState
    if (this.nextProps) this.props = this.nextProps
    if (shouldUpdate === false) return
    this.forceUpdate()
  }
  emitUpdate(nextProps) {
    this.nextProps = nextProps
    if (this.nextProps || this.pendingStates.length > 0) {
      this.updateIfNeeded()
    }
  }
  forceUpdate() {
    this.componentWillUpdate?.()
    const renderVdom = this.render()
    const oldDOMElement = getDOMElementByVdom(this.oldRenderVdom)
    const parentDOM = oldDOMElement.parentNode
    const newDOMElement = createDOMElement(renderVdom)
    parentDOM.replaceChild(newDOMElement, oldDOMElement)
    this.oldRenderVdom = renderVdom
    this.componentDidUpdate?.(this.props, this.state)
  }
}
function createRef() {
  return {
    current: null,
  }
}
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
