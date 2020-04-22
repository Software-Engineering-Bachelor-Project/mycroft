import React, { Component } from "react";
import { connect } from "react-redux";

// CSS
import styles from "./viewport.module.css";

// Components
import Map from "../map/map";

/* -- Viewport -- */
class Viewport extends Component {
  render() {
    return (
      <div className={styles.viewport}>
        <Map />
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {};
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Viewport);
