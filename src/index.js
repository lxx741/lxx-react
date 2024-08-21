import React from './react'
import ReactDOM from './react-dom/client'

// 通过 forwardRef 创建出的组件，可以将 ref 传递给内部元素
const ForwardedButton = React.forwardRef((props, ref) => (
  <input ref={ref} {...props} />
))

class App extends React.Component {
  constructor(props) {
    super(props)
    // 创建 ref 对象
    this.inputRef = React.createRef()
  }
  render() {
    return (
      <div>
        {/* 将 ref 传给通过 forwardRef 创建出的组件 */}
        <ForwardedButton ref={this.inputRef} />
        <button onClick={() => this.inputRef.current.focus()}>focus</button>
      </div>
    )
  }
}
const classElement = <App />
ReactDOM.createRoot(document.getElementById('root')).render(classElement)
