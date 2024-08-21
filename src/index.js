import React from './react' // 导入react核心包
import ReactDOM from './react-dom/client' // 导入react web平台渲染包
import utils from 'zhang-utils' // 导入工具包
// 创建虚拟节点（react element）
// const element = React.createElement(
//   'div',
//   {
//     style: {
//       color: 'red',
//     },
//     className: 'wrapper',
//   },
//   'hello',
//   React.createElement(
//     'span',
//     {
//       style: {
//         color: 'blue',
//       },
//     },
//     'world'
//   )
// )
// console.log(
//   JSON.stringify(utils.removePrivateProps(element, ['key', 'ref']), null, 2)
// )

// 使用JSX语法创建虚拟节点
const jsxElement = (
  <div style={{ color: 'red' }} className='wrapper'>
    hello<span style={{ color: 'blue' }}>world</span>
  </div>
)
console.log(
  JSON.stringify(utils.removePrivateProps(jsxElement, ['key', 'ref']), null, 2)
)
// 创建跟容器并把虚拟节点渲染到容器中
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(jsxElement)
