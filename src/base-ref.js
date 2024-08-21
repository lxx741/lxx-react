import React from './react'
import ReactDOM from './react-dom/client'
class RefComponent extends React.Component {
  constructor(props) {
    super(props)
    // 创建引用
    this.inputRef = React.createRef()
  }
  handleButtonClick = () => {
    // 通过ref对象的current属性获取DOM节点并获取焦点
    this.inputRef.current.focus()
  }
  render() {
    return (
      <div>
        {/* 给input元素添加ref属性 */}
        <input
          ref={this.inputRef}
          type='text'
          placeholder='Click button to focus me'
        />
        <button onClick={this.handleButtonClick}>Focus Input</button>
      </div>
    )
  }
}
const classElement = <RefComponent />
ReactDOM.createRoot(document.getElementById('root')).render(classElement)
