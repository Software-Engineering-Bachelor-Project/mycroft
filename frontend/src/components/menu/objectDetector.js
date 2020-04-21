import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setRate,
  setTarget,
  toggleIsRunning,
  TARGET,
} from "../../state/stateObjectDetector";
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
  }

  handleRateChange(event) {
    this.props.setRate(parseInt(event.target.value));
  }

  handleTargetChange(event) {
    this.props.setTarget(event);
  }

  handleSubmit(event) {
    this.props.toggleIsRunning();

    console.log(this.props);

    /*
    Temp 
    TODO: 
        Make object detection request.
        Do progress requests.
        Close modal when progress is 100%.
    */

    // Close modal
    setTimeout(() => {
      this.props.toggleShow();
      this.props.toggleIsRunning();
    }, 1000);
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={() => this.props.toggleShow()}
        centered
      >
        <Modal.Header closeButton>
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
              />
              <Form.Text className="text-muted">
                Seconds between analyzed frames.
              </Form.Text>
            </Form.Group>

            {/* Choose target buttons */}
            <Form.Label>Target</Form.Label>
            <br />
            <ToggleButtonGroup
              name="target"
              type="radio"
              defaultValue={TARGET.CLIPS}
              onChange={this.handleTargetChange}
            >
              <ToggleButton variant="light" value={TARGET.CLIPS}>
                All clips in filter
              </ToggleButton>
              <ToggleButton variant="light" value={TARGET.PROJECT}>
                All clips in project
              </ToggleButton>
            </ToggleButtonGroup>
          </Form>
        </Modal.Body>

        <Modal.Footer>
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
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    setRate: (newRate) => dispatch(setRate(newRate)),
    setTarget: (newTarget) => dispatch(setTarget(newTarget)),
    toggleIsRunning: () => dispatch(toggleIsRunning()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(ObjectDetector);
