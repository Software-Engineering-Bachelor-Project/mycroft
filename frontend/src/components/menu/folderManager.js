import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import ListGroup from "react-bootstrap/ListGroup";

import styles from "./folderManager.module.css";

import {
  addFolder,
  removeFolder,
  getSourceFolders,
  getFiles,
} from "../../state/stateCommunication";

import {
  syncProject,
  doActionsInOrder,
  getDuplicates,
  getOverlapping,
} from "../../util";

class FolderManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      modified: false,
      showingWarnings: false,
    };

    this.hasFolders = this.hasFolders.bind(this);
    this.isChosen = this.isChosen.bind(this);
    this.toggleFolder = this.toggleFolder.bind(this);
    this.handleFinished = this.handleFinished.bind(this);
    this.renderWarnings = this.renderWarnings.bind(this);
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
      this.props.getFiles,
    ]);
  }

  handleFinished() {
    this.props.toggleShow();
    if (this.state.modified) this.props.showObjectDetector(true);
    this.setState({ modified: false, showingWarnings: false });
    syncProject();
  }

  renderWarnings() {
    const duplicates = getDuplicates(this.props.clips);
    const overlapping = getOverlapping(this.props.clips);
    const unplayable = Object.values(this.props.clips).filter(
      (c) => !c.playable
    );

    // Don't show button if there are no  warnings.
    if (duplicates.length === 0 && overlapping.length === 0) {
      return "";
    }

    return (
      <Accordion>
        <Card>
          {/* Warnings */}
          <Accordion.Collapse eventKey="0" in={this.state.showingWarnings}>
            <Card.Body>
              <Container>
                {/* Duplicates */}
                {duplicates.length > 0 ? (
                  <>
                    <strong>Duplicates</strong>
                    <ListGroup>
                      {duplicates.map((d, index) => (
                        <ListGroup.Item key={index}>
                          {d.map((c) => (
                            <div key={c.id}>
                              {c.getPath(this.props.folders)}
                              <br />
                            </div>
                          ))}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                ) : (
                  ""
                )}

                {/* Overlapping */}
                {overlapping.length > 0 ? (
                  <div style={{ marginTop: 10 }}>
                    <strong>Overlapping</strong>
                    <ListGroup>
                      {overlapping.map((o, index) => (
                        <ListGroup.Item key={index}>
                          {o.map((c) => (
                            <div key={c.id}>
                              {c.getPath(this.props.folders)}
                              <br />
                            </div>
                          ))}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                ) : (
                  ""
                )}

                {/* Unplayable clips */}
                {unplayable.length > 0 ? (
                  <>
                    <strong>Unplayable</strong>
                    <ListGroup>
                      {unplayable.map((c) => (
                        <ListGroup.Item key={c.id}>
                          {c.getPath(this.props.folders)}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </>
                ) : (
                  ""
                )}
              </Container>
            </Card.Body>
          </Accordion.Collapse>
          {/* Button */}
          <Accordion.Toggle
            as={Button}
            variant="warning"
            eventKey="0"
            onClick={() =>
              this.setState({ showingWarnings: !this.state.showingWarnings })
            }
          >
            {this.state.showingWarnings ? "Hide Warnings" : "Show Warnings"}
          </Accordion.Toggle>
        </Card>
      </Accordion>
    );
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.hasFolders() ? this.handleFinished : () => {}}
        onShow={() => {
          this.props.getSourceFolders();
          syncProject();
        }}
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

        {this.renderWarnings()}

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
    clips: state.com.clips,
    folders: state.com.folders,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    addFolder: (id) => dispatch(addFolder(id)),
    removeFolder: (id) => dispatch(removeFolder(id)),
    getSourceFolders: () => dispatch(getSourceFolders()),
    getFiles: () => dispatch(getFiles()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(FolderManager);
