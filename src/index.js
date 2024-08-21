import React from './react'
import ReactDOM from './react-dom/client'
class Hello extends React.Component {
  render() {
    return <p>hello</p>
  }
}
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      list: ['A', 'B', 'C', 'D', 'E', 'F'],
      num: 1,
    }
  }
  handleClick = () => {
    this.setState({
      list: ['A', 'C', 'E', 'B', 'G'],
      num: 2,
    })
  }
  render() {
    return (
      <div>
        {this.state.num}
        <div>
          <Hello />
          {this.state.list.map((item) => (
            <div key={item}>{item}</div>
          ))}
          {this.state.num === 1 ? <Hello /> : null}
        </div>
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
const classElement = <Counter />
ReactDOM.createRoot(document.getElementById('root')).render(classElement)
