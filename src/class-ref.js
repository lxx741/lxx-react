import React from './react'
import ReactDOM from './react-dom/client'
class ChildComponent extends React.Component {
  alertMessage = () => {
    alert('Hello from ChildComponent!')
  }
  render() {
    return <div>I'm the child component.</div>
  }
}
class ParentComponent extends React.Component {
  constructor(props) {
    super(props)
    this.childRef = React.createRef()
  }
  handleButtonClick = () => {
    this.childRef.current.alertMessage()
  }
  render() {
    return (
      <div>
        <ChildComponent ref={this.childRef} />
        <button onClick={this.handleButtonClick}>Call Child Method</button>
      </div>
    )
  }
}
const classElement = <ParentComponent />
ReactDOM.createRoot(document.getElementById('root')).render(classElement)
