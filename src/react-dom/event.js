// 定义事件类型方法
const eventTypeMethods = {
  // 点击事件
  click: {
    capture: 'onClickCapture', // 捕获阶段
    bubble: 'onClick', // 冒泡阶段
  },
}
// 根据原生事件创建合成事件
function createSyntheticEvent(nativeEvent) {
  // 是否停止冒泡标识
  let isPropagationStopped = false

  // 定义代理对象处理器
  const handlers = {
    get(target, key) {
      if (target.hasOwnProperty(key)) return Reflect.get(target, key)
      if (typeof nativeEvent[key] === 'function') {
        return nativeEvent[key].bind(nativeEvent)
      } else {
        return nativeEvent[key]
      }
    },
  }
  // 定义合成事件
  const syntheticEvent = new Proxy(
    {
      nativeEvent, // 原生事件
      // 阻止默认事件，抹平平台差异
      preventDefault() {
        if (nativeEvent.preventDefault) {
          nativeEvent.preventDefault()
        } else {
          nativeEvent.returnValue = false
        }
      },
      // 阻止冒泡事件，抹平平台差异
      stopPropagation() {
        if (nativeEvent.stopPropagation) {
          nativeEvent.stopPropagation()
        } else {
          nativeEvent.cancelBubble = true
        }
        isPropagationStopped = true
      },
      isPropagationStopped() {
        return isPropagationStopped
      },
    },
    handlers
  )
  return syntheticEvent
}
// 处理事件委托
export default function setupEventDelegation(container) {
  // 根容器上委托过
  if (container._reactEventDelegated) return
  ;['capture', 'bubble'].forEach((phase) => {
    Reflect.ownKeys(eventTypeMethods).forEach((type) => {
      container.addEventListener(
        type,
        (nativeEvent) => {
          // 创建合成事件对象
          const syntheticEvent = createSyntheticEvent(nativeEvent)
          // 获取事件传播路径
          const path = syntheticEvent.composedPath()
          // 事件方法名
          const methodName = eventTypeMethods[type][phase]
          // 捕获阶段反转传播路径
          const elements = phase === 'capture' ? path.reverse() : path
          for (let element of elements) {
            // 已阻止冒泡，则不再进行后续事件处理函数的执行
            if (syntheticEvent.isPropagationStopped()) {
              break
            }
            element.reactEvents?.[methodName]?.(syntheticEvent)
          }
        },
        phase === 'capture'
      )
    })
  })
  // 根容器上是否已经委托过事件处理函数
  container._reactEventDelegated = true
}
