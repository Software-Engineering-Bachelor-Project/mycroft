import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setRate,
  setTarget,
  toggleIsRunning,
  TARGET,
} from "../../state/stateObjectDetector";
import {
  detectObjects,
  getODProgress,
  deleteODProgress,
} from "../../state/stateCommunication";
import { setNewProject } from "../../state/stateMenu";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ProgressBar from "react-bootstrap/ProgressBar";

/* -- Object detector -- */
class ObjectDetector extends Component {
  constructor(props) {
    super(props);

    this.handleRateChange = this.handleRateChange.bind(this);
    this.handleTargetChange = this.handleTargetChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleFinished = this.handleFinished.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.renderTargetButtons = this.renderTargetButtons.bind(this);
  }

  handleRateChange(event) {
    let newRate = parseInt(event.target.value);

    // Prevent negative ratio.
    if (newRate < 0) event.target.value = "0";

    this.props.setRate(newRate);
  }

  handleTargetChange(event) {
    this.props.setTarget(event);
  }

  handleSubmit(event) {
    // Make detection request.
    this.props.toggleIsRunning();
    this.props.detectObjects(
      this.props.rate,
      this.props.newProject ? TARGET.PROJECT : this.props.target
    );

    // Update progress bar until detection is finished.
    let id = setInterval(() => {
      this.props.getODProgress();
      this.handleFinished(id);
    }, 1000);
  }

  handleFinished(intervalID) {
    if (this.props.currentProgress >= 100) {
      // Stop requesting progress
      clearInterval(intervalID);

      // Close modal
      this.props.deleteODProgress();
      this.handleClose();
      setTimeout(() => this.props.toggleIsRunning(), 500);
    }
  }

  handleClose() {
    this.props.toggleShow();
    this.props.setNewProject(false);
  }

  renderTargetButtons() {
    return (
      <>
        {/* Choose target buttons */}
        <Form.Label>Target</Form.Label>
        <br />
        <ToggleButtonGroup
          name="target"
          type="radio"
          defaultValue={this.props.target}
          onChange={this.handleTargetChange}
        >
          <ToggleButton
            variant="light"
            value={TARGET.FILTER}
            disabled={this.props.isRunning}
          >
            All clips in filter
          </ToggleButton>
          <ToggleButton
            variant="light"
            value={TARGET.PROJECT}
            disabled={this.props.isRunning}
          >
            All clips in project
          </ToggleButton>
        </ToggleButtonGroup>
      </>
    );
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={() => (this.props.isRunning ? () => {} : this.handleClose())}
        centered
      >
        <Modal.Header closeButton={!this.props.isRunning}>
          {" "}
          <Modal.Title>Object detection</Modal.Title>{" "}
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Rate input */}
            <Form.Group controlId="formRate">
              <Form.Label>Rate</Form.Label>
              <Form.Control
                name="rate"
                type="number"
                defaultValue={this.props.rate}
                onChange={this.handleRateChange}
                disabled={this.props.isRunning}
              />
              <Form.Text className="text-muted">
                Seconds between analyzed frames.
              </Form.Text>
            </Form.Group>

            {!this.props.newProject ? this.renderTargetButtons() : ""}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          {this.props.fromFolderManager ? (
            <Button
              variant="secondary"
              onClick={this.handleClose}
              disabled={this.props.isRunning}
            >
              Skip
            </Button>
          ) : (
            ""
          )}
          <Button
            variant="primary"
            type="submit"
            onClick={this.handleSubmit}
            disabled={this.props.isRunning}
          >
            Run
          </Button>
        </Modal.Footer>

        <ProgressBar
          variant="success"
          now={this.props.currentProgress}
          label={`${this.props.currentProgress}%`}
        />
      </Modal>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    rate: state.od.rate,
    target: state.od.target,
    isRunning: state.od.isRunning,
    currentProgress: state.com.od.currentProgress,
    newProject: state.menu.newProject,
    fromFolderManager: state.menu.fromFolderManager,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    setRate: (newRate) => dispatch(setRate(newRate)),
    setTarget: (newTarget) => dispatch(setTarget(newTarget)),
    toggleIsRunning: () => dispatch(toggleIsRunning()),
    detectObjects: (rate, target) => dispatch(detectObjects(rate, target)),
    getODProgress: () => dispatch(getODProgress()),
    deleteODProgress: () => dispatch(deleteODProgress()),
    setNewProject: (b) => dispatch(setNewProject(b)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(ObjectDetector);
