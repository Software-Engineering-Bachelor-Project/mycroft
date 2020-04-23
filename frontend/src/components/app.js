import React, { Component } from "react";
import { render } from "react-dom";
import { Provider } from "react-redux";
import store from "../state/state";

// CSS
import "./main.css";

// Import Core Components
import Menu from "./menu/menu";
import Viewport from "./viewport/viewport";
import MiniViewport from "./viewport/miniViewport";
import Timeline from "./timeline/timeline";
import Browser from "./browser/browser";
import Player from "./player/player";
import Map from "./map/map";

// TODO: Remove
import Evoker from "./evoker";

const state = store.getState();

/*
 * This is the main component of Mycroft.
 */

/* -- ROOT COMPONENT -- */
class App extends Component {
  render() {
    return (
      <div>
        <Menu />

        {/* mode decides which component Viewport and MiniViewport should render */}
        <Viewport content={state.viewport.mode ? <Map /> : <Player />} />
        <MiniViewport content={state.viewport.mode ? <Player /> : <Map />} />
        <Browser />
        <Timeline />
        <Evoker />
      </div>
    );
  }
}

// Export App
export default App;

// Put App component in template
const container = document.getElementById("app");
// Note that the App is wrapped with react-redux's Provider
render(
  <Provider store={store}>
    <App />
  </Provider>,
  container
);
