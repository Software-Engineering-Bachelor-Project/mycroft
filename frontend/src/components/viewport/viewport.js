import React, { Component } from "react";
import { connect } from "react-redux";

// CSS
import styles from "./viewport.module.css";

// import components
import Player from "../player/player";
import Map from "../map/map";

/* -- Viewport -- */
class Viewport extends Component {
  render() {
    return (
      <div className={styles.viewport}>
        {/* viewportMode decides which component Viewport should render */}
        {this.props.viewportMode ? <Map /> : <Player />}
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    viewportMode: state.viewport.mode,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Viewport);
