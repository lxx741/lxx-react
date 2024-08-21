import React from './react'
import ReactDOM from './react-dom/client'
class ClassComponent extends React.Component {
  parentBubble() {
    console.log('parentBubble 父节点在冒泡阶段执行')
  }
  childBubble(event) {
    console.log('childBubble 子节点在冒泡阶段执行')
    event.stopPropagation()
  }
  parentCapture(event) {
    console.log('parentCapture 父节点在捕获阶段执行')
    //event.stopPropagation();
  }
  childCapture() {
    console.log('childCapture 子节点在捕获阶段执行')
  }
  clickLink(event) {
    event.preventDefault()
  }
  render() {
    return (
      <div
        id='parent'
        onClick={this.parentBubble}
        onClickCapture={this.parentCapture}>
        <button
          id='child'
          onClick={this.childBubble}
          onClickCapture={this.childCapture}>
          点击
        </button>
        <a onClick={this.clickLink} href='https://www.baidu.com'>
          clickLink
        </a>
      </div>
    )
  }
}
const element = <ClassComponent />
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(element)

setTimeout(() => {
  document.getElementById('root').addEventListener(
    'click',
    () => {
      console.log(`    Native rootCapture 原生的root的捕获`)
    },
    true
  )
  document.getElementById('root').addEventListener(
    'click',
    () => {
      console.log(`    Native rootBubble 原生的root的冒泡`)
    },
    false
  )
  document.getElementById('parent').addEventListener(
    'click',
    () => {
      console.log(`    Native parentCapture 原生的父亲的捕获`)
    },
    true
  )
  document.getElementById('child').addEventListener(
    'click',
    () => {
      console.log(`    Native childCapture 原生的儿子的捕获`)
    },
    true
  )
  document.getElementById('parent').addEventListener('click', () => {
    console.log(`    Native parentBubble 原生的父亲的冒泡`)
  })
  document.getElementById('child').addEventListener('click', () => {
    console.log(`    Native childBubble 原生的儿子的冒泡`)
  })
}, 1000)
/**
parentCapture;event.stopPropagation();
parentCapture 父节点在捕获阶段执行
     Native rootCapture 原生的root的捕获

childBubble;event.stopPropagation();
parentCapture 父节点在捕获阶段执行
childCapture 子节点在捕获阶段执行
     Native rootCapture 原生的root的捕获
     Native parentCapture 原生的父亲的捕获
     Native childCapture 原生的儿子的捕获
     Native childBubble 原生的儿子的冒泡
     Native parentBubble 原生的父亲的冒泡
childBubble 子节点在冒泡阶段执行
     Native rootBubble 原生的root的冒泡

clickLink
parentCapture 父节点在捕获阶段执行
     Native rootCapture 原生的root的捕获
     Native parentCapture 原生的父亲的捕获
     Native parentBubble 原生的父亲的冒泡
parentBubble 父节点在冒泡阶段执行
     Native rootBubble 原生的root的冒泡
 */
