import React from "./react";
import ReactDOM from "./react-dom/client";
class Counter extends React.Component {
  static defaultProps = {
    name: "Counter",
  };
  constructor(props) {
    super(props);
    this.state = {
      number: 0,
    };
    console.log("Counter 1.constructor");
  }
  componentWillMount() {
    console.log("Counter 2.componentWillMount");
  }
  componentDidMount() {
    console.log("Counter 4.componentDidMount");
  }
  handleClick = () => {
    this.setState({
      number: this.state.number + 1,
    });
  };
  shouldComponentUpdate(nextProps, nextState) {
    console.log("Counter 5.shouldComponentUpdate");
    return nextState.number % 2 === 0;
  }
  componentWillUpdate() {
    console.log("Counter 6.componentWillUpdate");
  }
  componentDidUpdate() {
    console.log("Counter 7.componentDidUpdate");
  }
  render() {
    console.log("Counter 3.render");
    return (
      <div>
        <p>{this.state.number}</p>
        <button onClick={this.handleClick}>+</button>
      </div>
    );
  }
}
const classElement = <Counter />;
ReactDOM.createRoot(document.getElementById("root")).render(classElement);

/**
Counter 1.constructor
Counter 2.componentWillMount
Counter 3.render
Counter 4.componentDidMount
2Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
Counter 7.componentDidUpdate
2Counter 5.shouldComponentUpdate
Counter 6.componentWillUpdate
Counter 3.render
Counter 7.componentDidUpdate
 */