import React, { Component } from "react";
import { connect } from "react-redux";

import styles from "./menu.module.css";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import { toggleShowObjectDetection } from "../../state/stateMenu";
import ObjectDetector from "./objectDetector";

/* -- Menu -- */
class Menu extends Component {
  switchProject() {
    console.log("Switch Project was clicked.");
  }

  manageSources() {
    console.log("Manage Sources was clicked.");
  }

  exportJSON() {
    console.log("Export JSON was clicked.");
  }

  exportClips() {
    console.log("Export Clips was clicked.");
  }

  detectObjects() {
    this.props.toggleShowObjectDetection();
  }

  render() {
    return (
      <div className={styles.menu}>
        <DropdownButton
          alignRight
          title="Project"
          id="dropdown-menu-align-right"
        >
          <Dropdown.Item onClick={() => this.switchProject()}>
            {" "}
            Switch Project{" "}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.manageSources()}>
            {" "}
            Manage Sources{" "}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.exportJSON()}>
            {" "}
            Export JSON{" "}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.exportClips()}>
            {" "}
            Export Clips{" "}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.detectObjects()}>
            {" "}
            Object detection{" "}
          </Dropdown.Item>
        </DropdownButton>

        <ObjectDetector
          show={this.props.showObjectDetection}
          toggleShow={this.props.toggleShowObjectDetection}
        />
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    showObjectDetection: state.menu.showObjectDetection,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    toggleShowObjectDetection: () => dispatch(toggleShowObjectDetection()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Menu);