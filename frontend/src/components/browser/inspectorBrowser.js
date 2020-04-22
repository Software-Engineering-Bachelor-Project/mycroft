import React, { Component } from "react";
import { connect } from "react-redux";

//React Bootstrap components
import Tooltip from "react-bootstrap/Tooltip";
import Overlay from "react-bootstrap/Overlay";

// Import relevant components
import styles from "./browser.module.css";

// Import state
import {
  changeMode,
  INSPECTOR_MODE_AREA,
  INSPECTOR_MODE_CLIP,
  INSPECTOR_MODE_CAMERA,
  INSPECTOR_MODE_EXLUDED_INCLUDED,
} from "../../state/stateBrowser";
import { modifyFilter } from "../../state/stateCommunication";

/* -- Browser -- */
class InspectorBrowser extends Component {
  constructor(props) {
    super(props);

    this.displayMode = this.displayMode.bind(this);
    this.renderClip = this.renderClip.bind(this);
    this.renderCamera = this.renderCamera.bind(this);
    this.renderExlusiveIncluded = this.renderExlusiveIncluded.bind(this);
    this.renderArea = this.renderArea.bind(this);
  }

  displayMode(mode) {
    switch (mode) {
      case INSPECTOR_MODE_CAMERA:
        return this.renderCamera();
      case INSPECTOR_MODE_CLIP:
        return this.renderClip();
      case INSPECTOR_MODE_EXLUDED_INCLUDED:
        return;
        this.renderExlusiveIncluded();
      case INSPECTOR_MODE_AREA:
        return;
        this.renderArea();

      default:
        return;
    }
  }

  renderCamera() {
    return (
      <div>
        <h3 className={styles.browserInspectorHeader}>Camera</h3>
      </div>
    );
  }

  renderClip() {
    return (
      <div>
        <h3 className={styles.browserInspectorHeader}>Clip</h3>
      </div>
    );
  }
  renderExlusiveIncluded() {
    return (
      <div>
        <h3 className={styles.browserInspectorHeader}>Selected clips</h3>
      </div>
    );
  }

  renderArea() {
    return (
      <div>
        <h3 className={styles.browserInspectorHeader}>Area</h3>
      </div>
    );
  }

  render() {
    return (
      <div className={styles.main}>
        {this.displayMode(this.props.inspector.mode)}
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    inspector: state.browser.inspector,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    changeMode: () => dispatch(changeMode(INSPECTOR_MODE_CLIP, 0)), //place selector
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(InspectorBrowser);
