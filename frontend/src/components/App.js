import React, { Component } from "react";
import { render } from "react-dom";
import {createStore} from 'redux';

class App extends Component {
  render() {
    return (
      <p>Mycroft</p>
    );
  }
}

export default App;

const container = document.getElementById("app");
render(<App />, container);
