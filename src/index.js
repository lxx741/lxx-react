import React from './react' // 导入react核心包
import ReactDOM from './react-dom/client' // 导入react web平台渲染包

// 函数组件
// function FunctionComponent() {
//   return (
//     <div style={{ color: 'red' }} className='wrapper'>
//       hello<span style={{ color: 'blue' }}>world</span>
//     </div>
//   )
// }
// const functionElement = <FunctionComponent name='函数组件' />
// console.log(functionElement)

// 类组件
class ClassComponent extends React.Component {
  render() {
    return (
      <div style={{ color: 'red' }} className='wrapper'>
        hello<span style={{ color: 'blue' }}>world</span>
      </div>
    )
  }
}
const classElement = <ClassComponent name='类组件' />

// 创建跟容器并把虚拟节点渲染到容器中
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(classElement)
