import React, { Component } from "react";
import { connect } from "react-redux";

// CSS
import styles from "./viewport.module.css";

// import components
import Player from "../player/player";
import Map from "../map/map";

/* -- Mini Viewport -- */
class MiniViewport extends Component {
  render() {
    return (
      <div className={styles.miniViewport}>
        {/* viewportMode decides which component MiniViewport should render */}
        {this.props.viewportMode ? <Player /> : <Map />}
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
export default connect(mapStateToProps, mapDispatchToProps)(MiniViewport);
