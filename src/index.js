import React from './react'
import ReactDOM from './react-dom/client'
class Counter extends React.Component {
  static defaultProps = {
    name: 'Counter',
  }
  constructor(props) {
    super(props)
    this.state = {
      number: 0,
    }
    console.log('Counter 1.constructor')
  }
  componentWillMount() {
    console.log('Counter 2.componentWillMount')
  }
  componentDidMount() {
    console.log('Counter 4.componentDidMount')
  }
  handleClick = () => {
    this.setState({
      number: this.state.number + 1,
    })
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('Counter 5.shouldComponentUpdate')
    return nextState.number % 2 === 0
  }
  componentWillUpdate() {
    console.log('Counter 6.componentWillUpdate')
  }
  componentDidUpdate() {
    console.log('Counter 7.componentDidUpdate')
  }
  render() {
    console.log('Counter 3.render')
    return (
      <div>
        <p>{this.state.number}</p>
        {this.state.number === 4 ? null : (
          <ChildCounter count={this.state.number} />
        )}
        <button onClick={this.handleClick}>+</button>
      </div>
    )
  }
}
class ChildCounter extends React.Component {
  componentWillUnmount() {
    console.log(' ChildCounter 6.componentWillUnmount')
  }
  componentWillMount() {
    console.log('ChildCounter 1.componentWillMount')
  }
  render() {
    console.log('ChildCounter 2.render')
    return <div>{this.props.count}</div>
  }
  componentDidMount() {
    console.log('ChildCounter 3.componentDidMount')
  }
  componentWillReceiveProps(newProps) {
    console.log('ChildCounter 4.componentWillReceiveProps')
  }
  shouldComponentUpdate(nextProps, nextState) {
    console.log('ChildCounter 5.shouldComponentUpdate')
    return nextProps.count % 3 === 0
  }
}
const classElement = <Counter />
ReactDOM.createRoot(document.getElementById('root')).render(classElement)
