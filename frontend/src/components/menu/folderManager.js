import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";

import styles from "./folderManager.module.css";

import {
  addFolder,
  removeFolder,
  getSourceFolders,
} from "../../state/stateCommunication";

import { syncProject, doActionsInOrder } from "../../util";

class FolderManager extends Component {
  constructor(props) {
    super(props);

    this.state = { modified: false };

    this.hasFolders = this.hasFolders.bind(this);
    this.isChosen = this.isChosen.bind(this);
    this.toggleFolder = this.toggleFolder.bind(this);
    this.handleFinished = this.handleFinished.bind(this);
  }

  hasFolders() {
    return this.props.selectedFolders.length > 0;
  }

  isChosen(id) {
    return this.props.selectedFolders.includes(id);
  }

  toggleFolder(id) {
    doActionsInOrder([
      () => {
        if (this.isChosen(id)) this.props.removeFolder(id);
        else {
          this.setState({ modified: true });
          this.props.addFolder(id);
        }
      },
      syncProject,
    ]);
  }

  handleFinished() {
    this.props.toggleShow();
    if (this.state.modified) this.props.showObjectDetector(true);
    this.setState({ modified: false });
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.hasFolders() ? this.handleFinished : () => {}}
        onShow={this.props.getSourceFolders}
        centered
      >
        <Modal.Header closeButton={this.hasFolders()}>
          <Modal.Title>{"Manage source folders"}</Modal.Title>
        </Modal.Header>

        {/* Folder list */}
        <Modal.Body className={styles.folderList}>
          {Object.values(this.props.sourceFolders).map((f) => (
            <Card body key={f.id}>
              <div className={styles.folderItemName}>
                <Card.Title>{f.name}</Card.Title>
                <Card.Text className="text-muted">
                  <span className={styles.folderPath}>
                    {f.absolutePath + f.name}
                  </span>
                </Card.Text>
              </div>
              <Button
                onClick={() => this.toggleFolder(f.id)}
                className={styles.folderItemButton}
                variant={this.isChosen(f.id) ? "danger" : "success"}
              >
                {this.isChosen(f.id) ? "Remove" : "Select"}
              </Button>
            </Card>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleFinished} disabled={!this.hasFolders()}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    sourceFolders: state.com.sourceFolders,
    selectedFolders: state.com.currentSourceFolders,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    addFolder: (id) => dispatch(addFolder(id)),
    removeFolder: (id) => dispatch(removeFolder(id)),
    getSourceFolders: () => dispatch(getSourceFolders()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(FolderManager);
