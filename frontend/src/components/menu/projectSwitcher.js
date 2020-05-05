import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

import styles from "./projectSwitcher.module.css";

import {
  getProjects,
  openProject,
  deleteProject,
  newProject,
  renameProject,
} from "../../state/stateCommunication";
import { setNewProject } from "../../state/stateMenu";
import { doActionsInOrder, syncProject } from "../../util";

/* -- Object detector -- */
class ProjectSwitcher extends Component {
  constructor(props) {
    super(props);

    // Keep track of what accordion is currently opened
    this.state = {
      open: -1,
    };

    // Bind functions
    this.openProject = this.openProject.bind(this);
    this.deleteProject = this.deleteProject.bind(this);
    this.newProject = this.newProject.bind(this);
    this.renameProject = this.renameProject.bind(this);
    this.validChar = this.validChar.bind(this);
    this.deletionPopover = this.deletionPopover.bind(this);
    this.isToggled = this.isToggled.bind(this);
    this.toggle = this.toggle.bind(this);
    this.renderConfirmBox = this.renderConfirmBox.bind(this);
    this.renderProjectItem = this.renderProjectItem.bind(this);
    this.hasOpenProject = this.hasOpenProject.bind(this);
  }

  // Call this method to open a project
  openProject(id) {
    this.props.openProject(id);
    this.toggle(id);
    this.props.toggleShow();
    syncProject();
  }

  // Call this method to delete a project
  deleteProject(id) {
    doActionsInOrder([
      () => this.props.deleteProject(id),
      this.props.getProjects,
    ]);
  }

  // Call this method to rename a project
  renameProject(id, name) {
    if (name.length <= 0) return;

    doActionsInOrder([
      () => this.props.renameProject(id, name),
      this.props.getProjects,
      () => this.toggle(id),
    ]);
  }

  // Call this method to create a new project
  newProject(name) {
    if (name.length <= 0) return;

    doActionsInOrder([
      () => this.props.newProject(name),
      this.props.getProjects,
      () => {
        this.props.toggleShow();
        this.props.showFolderManager();
      },
    ]);

    this.props.setNewProject(true);
  }

  // This method decides what characters are allowed in project names
  validChar(c) {
    return (
      (48 <= c && c <= 57) || // Digits
      (65 <= c && c <= 90) || // Upper case
      (97 <= c && c <= 122) || // Lower case
      c == 95 // Underscore
    );
  }

  // Render the deletion confirm popover
  deletionPopover(proj) {
    return (
      <Popover>
        <Popover.Title style={{ textAlign: "center" }}>
          Are you sure?
        </Popover.Title>
        <Popover.Content className={styles.projectDeletionPopoverContent}>
          Delete project <strong>{proj.name}</strong>
          ?
          <br />
          <strong>
            <i>THIS CANNOT BE UNDONE</i>
          </strong>
          <Button
            variant="danger"
            onClick={(e) => {
              this.deleteProject(proj.id);
              e.stopPropagation();
            }}
          >
            DELETE
          </Button>
        </Popover.Content>
      </Popover>
    );
  }

  // Returns whether or not the specified project box is expanded
  isToggled(id) {
    return this.state.open == id;
  }

  // Expands or collapses the specified project box
  toggle(id) {
    this.setState({
      ...this.state,
      open: this.state.open == id ? -1 : id,
    });
  }

  // Renders the project box's expandable sub-box
  renderConfirmBox(proj) {
    return (
      <ListGroup style={{ textAlign: "center" }}>
        {/* Open project prompt */}
        {proj.id == this.props.projectID ? (
          ""
        ) : (
          <ListGroup.Item>
            <p style={{ marginBottom: "0" }}>
              Open project <strong>{proj.name}</strong>?
            </p>
            <br />
            <Button variant="primary" onClick={() => this.openProject(proj.id)}>
              Yes
            </Button>
            <Button
              style={{ marginLeft: "1em" }}
              variant="secondary"
              onClick={() => this.toggle(proj.id)}
            >
              No
            </Button>
          </ListGroup.Item>
        )}

        {/* Rename project prompt */}
        <ListGroup.Item>
          <InputGroup>
            <FormControl
              type="input"
              placeholder="New Project Name"
              maxLength="20"
              onKeyPress={(e) => {
                if (!this.validChar(e.charCode)) e.preventDefault();
              }}
              ref={(c) => (this.renameBoxes[proj.id] = c)}
            />
            <InputGroup.Append>
              <Button
                variant="primary"
                onClick={() =>
                  this.renameProject(proj.id, this.renameBoxes[proj.id].value)
                }
              >
                Rename
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </ListGroup.Item>
      </ListGroup>
    );
  }

  // Renders a project box and sub-box
  renderProjectItem(proj) {
    return (
      <Card key={proj.id} border="success">
        {/* Main project box */}
        <Accordion.Toggle
          as={Card.Body}
          eventKey={proj.id.toString()}
          className={styles.projectItem}
          style={{
            backgroundColor:
              proj.id == this.props.projectID ? "lightblue" : "lightgreen",
          }}
          onClick={() => this.toggle(proj.id)}
        >
          {/* Content display */}
          <strong>{proj.name}</strong>
          {proj.id == this.props.projectID ? <i> OPENED</i> : ""}
          <span className={styles.projectSubtext}>
            <br />
            Created: {proj.created.toDateString()}
            <br />
            Last Modified: {proj.lastUpdated.toDateString()}
          </span>

          {/* Delete button */}
          <OverlayTrigger
            trigger="click"
            placement="right"
            rootClose
            overlay={this.deletionPopover(proj)}
          >
            <Button
              variant="danger"
              className={styles.projectDeleteButton}
              onClick={(e) => e.stopPropagation()}
            >
              Delete
            </Button>
          </OverlayTrigger>
        </Accordion.Toggle>

        {/* Confirm box */}
        <Accordion.Collapse
          eventKey={proj.id.toString()}
          onEntered={(c) =>
            c.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            })
          }
          in={this.isToggled(proj.id)}
        >
          <Card.Header>{this.renderConfirmBox(proj)}</Card.Header>
        </Accordion.Collapse>
      </Card>
    );
  }

  // Returns whether or not a valid project is currently open
  hasOpenProject() {
    return this.props.projectID in this.props.projects;
  }

  render() {
    // Used for storing rename-input-box references
    this.renameBoxes = {};

    return (
      <Modal
        show={this.props.show}
        onHide={this.hasOpenProject() ? this.props.toggleShow : () => {}}
        onShow={this.props.getProjects}
        centered
      >
        <Modal.Header closeButton={this.hasOpenProject()}>
          {" "}
          <Modal.Title>
            {this.hasOpenProject() ? "Switch Project" : "Open Project"}
          </Modal.Title>{" "}
        </Modal.Header>

        {/* The project list */}
        <Modal.Body>
          <Accordion className={styles.projectList}>
            {/* Iterate through projects and create items */}
            {Object.values(this.props.projects).map((proj) =>
              this.renderProjectItem(proj)
            )}
          </Accordion>
        </Modal.Body>

        {/* Project creation */}
        <Modal.Footer>
          <InputGroup>
            <FormControl
              type="input"
              placeholder="New Project Name"
              maxLength="20"
              onKeyPress={(e) => {
                if (!this.validChar(e.charCode)) e.preventDefault();
              }}
              ref={(c) => (this.nameBox = c)}
            />
            <InputGroup.Append>
              <Button
                variant="primary"
                onClick={() => this.newProject(this.nameBox.value)}
              >
                Create
              </Button>
            </InputGroup.Append>
          </InputGroup>
        </Modal.Footer>
      </Modal>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    projectID: state.com.projectID,
    projects: state.com.projects,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    getProjects: () => dispatch(getProjects()),
    openProject: (id) => dispatch(openProject(id)),
    deleteProject: (id) => dispatch(deleteProject(id)),
    newProject: (name) => dispatch(newProject(name)),
    renameProject: (id, name) => dispatch(renameProject(id, name)),
    setNewProject: (b) => dispatch(setNewProject(b)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(ProjectSwitcher);
