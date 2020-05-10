import React, { Component } from "react";
import { connect } from "react-redux";

import styles from "./menu.module.css";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import {
  toggleShowObjectDetection,
  toggleShowProjectSwitcher,
  toggleShowFolderManager,
} from "../../state/stateMenu";
import ObjectDetector from "./objectDetector";
import ProjectSwitcher from "./projectSwitcher";
import FolderManager from "./folderManager";

/* -- Menu -- */
class Menu extends Component {
  switchProject() {
    this.props.toggleShowProjectSwitcher();
  }

  manageSources() {
    this.props.toggleShowFolderManager();
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
          <Dropdown.Item
            onClick={() => console.log("Exporting JSON.")}
            href={"/export/filter/" + this.props.filterID + "/"}
            download
          >
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
        <ProjectSwitcher
          show={this.props.showProjectSwitcher}
          toggleShow={this.props.toggleShowProjectSwitcher}
          showFolderManager={this.props.toggleShowFolderManager}
        />
        <FolderManager
          show={this.props.showFolderManager}
          toggleShow={this.props.toggleShowFolderManager}
          showObjectDetector={(b) => this.props.toggleShowObjectDetection(b)}
        />
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    showObjectDetection: state.menu.showObjectDetection,
    showProjectSwitcher: state.menu.showProjectSwitcher,
    showFolderManager: state.menu.showFolderManager,
    filterID: state.com.filter.filterID,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    toggleShowObjectDetection: (b = false) =>
      dispatch(toggleShowObjectDetection(b)),
    toggleShowProjectSwitcher: () => dispatch(toggleShowProjectSwitcher()),
    toggleShowFolderManager: () => dispatch(toggleShowFolderManager()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Menu);
