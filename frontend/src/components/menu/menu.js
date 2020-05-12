import React, { Component } from "react";
import { connect } from "react-redux";

import styles from "./menu.module.css";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

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
  constructor(props) {
    super(props);

    this.state = { showExportClipsModal: false };

    this.handleCloseExportClipsModal = this.handleCloseExportClipsModal.bind(
      this
    );
    this.renderExportClipsModal = this.renderExportClipsModal.bind(this);
  }

  switchProject() {
    this.props.toggleShowProjectSwitcher();
  }

  manageSources() {
    this.props.toggleShowFolderManager();
  }

  detectObjects() {
    this.props.toggleShowObjectDetection();
  }

  handleCloseExportClipsModal() {
    this.setState({ showExportClipsModal: false });
  }

  renderExportClipsModal() {
    return (
      <Modal
        show={this.state.showExportClipsModal}
        onHide={this.handleCloseExportClipsModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Export Clips</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <span>You are about to download all filtered clips.</span>
          <br />
          <span>This can be a very large file.</span>
          <br />
          <span>Are you sure?</span>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={this.handleCloseExportClipsModal}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              console.log("Exporting clips.");
              this.handleCloseExportClipsModal();
            }}
            href={"/export/clips/" + this.props.filterID + "/"}
            download
          >
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    );
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
          <Dropdown.Item
            onClick={() => this.setState({ showExportClipsModal: true })}
          >
            {" "}
            Export Clips{" "}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => this.detectObjects()}>
            {" "}
            Object Detection{" "}
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
        {this.renderExportClipsModal()}
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
