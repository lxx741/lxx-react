import React from './react'
import ReactDOM from './react-dom/client'
// import ReactDOM from "react-dom";
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      number: 0,
    }
  }
  handleClick = () => {
    this.setState({ number: this.state.number + 1 })
    console.log(this.state)
    this.setState({ number: this.state.number + 1 })
    console.log(this.state)
    setTimeout(() => {
      this.setState({ number: this.state.number + 1 })
      console.log(this.state)
      this.setState({ number: this.state.number + 1 })
      console.log(this.state)
    })
  }
  render() {
    return <button onClick={this.handleClick}>{this.state.number}</button>
  }
}
const classElement = <Counter />
ReactDOM.createRoot(document.getElementById('root')).render(classElement)
//ReactDOM.render(classElement, document.getElementById("root"));
