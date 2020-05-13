import React, { Component, useRef, useState } from "react";
import { connect } from "react-redux";

// CSS
import styles from "./filter.module.css";
import {
  Button,
  Image,
  OverlayTrigger,
  Popover,
  ListGroup,
  Form,
  Tooltip,
} from "react-bootstrap";
import filterUrl from "../../images/baseline_filter_list_white_18dp.png";
import {
  modifyFilter,
  getClipsMatchingFilter,
  getFilter,
} from "../../state/stateCommunication";
import { doActionsInOrder } from "../../util";
import {
  changeBrowserTab,
  changeMode,
  INSPECTOR_MODE_EXLUDED_INCLUDED,
} from "../../state/stateBrowser";

// import components

/* -- Mini Viewport -- */
class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPopover: false,
    };

    this.renderObjects = this.renderObjects.bind(this);
    this.renderResolutions = this.renderResolutions.bind(this);
    this.renderFrameRate = this.renderFrameRate.bind(this);
  }

  renderFrameRate() {
    return (
      <Form>
        <Form.Group controlId="f">
          <Form.Control
            type="number"
            defaultValue={this.props.minimumFramerate}
            onChange={(e) => {
              var res = parseInt(e.target.value);
              if (res === "") {
                res = 0;
              } else if (e.target.value.startsWith("-")) {
                e.target.value = "0";
                res = 0;
              }

              doActionsInOrder([
                () => this.props.modifyFilter({ min_framerate: res }),
                () => {
                  this.props.getClipsMatchingFilter();
                  this.props.getFilter();
                },
              ]);
            }}
          />
        </Form.Group>
      </Form>
    );
  }

  renderResolutions() {
    return (
      <Form>
        {Object.entries(this.props.availableResolutions).map(([id, res]) => (
          <Form.Check
            key={id}
            inline
            label={res.width.toString() + "x" + res.height.toString()}
            type={"checkbox"}
            id={id}
            defaultChecked={this.props.whitelistedResolutions.includes(
              parseInt(id)
            )}
            onClick={(e) => {
              var resolutions = new Set();
              // Add the resolutions already selected
              this.props.whitelistedResolutions.forEach((item) => {
                resolutions.add(item);
              });

              // Add or remove the selected resolution
              if (e.target.checked) {
                resolutions.add(parseInt(id));
              } else {
                resolutions.delete(parseInt(id));
              }

              // Update filter and affected values
              doActionsInOrder([
                () =>
                  this.props.modifyFilter({
                    whitelisted_resolutions: [...resolutions],
                  }),
                () => {
                  this.props.getClipsMatchingFilter();
                  this.props.getFilter();
                },
              ]);
            }}
          />
        ))}
      </Form>
    );
  }

  // Renders all objects in the filter
  renderObjects() {
    return (
      <Form>
        {Object.entries(this.props.availableObjects).map(([id, obj]) => (
          <Form.Check
            key={id}
            inline
            label={obj}
            type={"checkbox"}
            id={id}
            defaultChecked={this.props.classes.includes(obj)}
            onClick={(e) => {
              var classes = new Set();

              // Add the classes already selected
              this.props.classes.forEach((item) => {
                classes.add(item);
              });

              // Add or remove the selected object
              if (e.target.checked) {
                classes.add(obj);
              } else {
                classes.delete(obj);
              }

              // Update filter and affected values
              doActionsInOrder([
                () => this.props.modifyFilter({ classes: [...classes] }),
                () => {
                  this.props.getClipsMatchingFilter();
                  this.props.getFilter();
                },
              ]);
            }}
          />
        ))}
      </Form>
    );
  }

  render() {
    const popover = (
      <Popover id="popover-basic" className={styles.menu}>
        <Popover.Title as="h3">Current Filter</Popover.Title>

        <Popover.Content className={styles.popoverContent}>
          <ListGroup>
            <OverlayTrigger
              key={"Time"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-time`}>
                  Clips between these points in time will be included in the
                  filter (set the time in the timeline at the bottom of the
                  application).
                </Tooltip>
              }
            >
              <ListGroup.Item>
                <strong>Time:</strong>
                <p>{this.props.startTime.toString().slice(0, 24)}</p>-
                <p>{this.props.endTime.toString().slice(0, 24)}</p>
              </ListGroup.Item>
            </OverlayTrigger>{" "}
            <OverlayTrigger
              key={"Objects"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-objects`}>
                  If clips contain these objects they will be included in the
                  filter (leave empty to allow all).
                </Tooltip>
              }
            >
              <ListGroup.Item>
                <strong>Objects:</strong> {this.renderObjects()}{" "}
              </ListGroup.Item>
            </OverlayTrigger>{" "}
            <OverlayTrigger
              key={"Whitelisted Resolutions"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-res`}>
                  If clips have any of these resolutions they will be included
                  in the filter (leave empty to allow all).
                </Tooltip>
              }
            >
              <ListGroup.Item>
                <strong>Whitelisted Resolutions:</strong>{" "}
                {this.renderResolutions()}
              </ListGroup.Item>
            </OverlayTrigger>{" "}
            <OverlayTrigger
              key={"Minimum Frame Rate"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-frameRate`}>
                  Clips with a frame rate higher than this will be included in
                  the filter (set to 0 to allow all).
                </Tooltip>
              }
            >
              <ListGroup.Item>
                <strong>Minimum Frame Rate:</strong> {this.renderFrameRate()}
              </ListGroup.Item>
            </OverlayTrigger>{" "}
            <OverlayTrigger
              key={"Included clips"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-icClips`}>
                  The amount of clips that will be included in the filter even
                  if they don't match the given time, objects, resolutions or
                  frame rates.
                </Tooltip>
              }
            >
              <ListGroup.Item>
                <strong>Included Clips:</strong>{" "}
                {this.props.includedClips.length}
                <Button
                  size="sm"
                  style={{
                    position: "absolute",
                    right: "1em",
                  }}
                  onClick={() => {
                    this.props.changeMode(0);
                    this.props.changeToInspector();
                  }}
                >
                  View
                </Button>
              </ListGroup.Item>
            </OverlayTrigger>{" "}
            <OverlayTrigger
              key={"Excluded clips"}
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-exClips`}>
                  The amount of clips that will be excluded in the filter even
                  if they match the given time, objects, resolutions and frame
                  rate.
                </Tooltip>
              }
            >
              <ListGroup.Item>
                <strong>Excluded Clips:</strong>{" "}
                {this.props.excludedClips.length}
                <Button
                  size="sm"
                  style={{
                    position: "absolute",
                    right: "1em",
                  }}
                  onClick={() => {
                    this.props.changeMode(1);
                    this.props.changeToInspector();
                  }}
                >
                  View
                </Button>
              </ListGroup.Item>
            </OverlayTrigger>{" "}
          </ListGroup>
        </Popover.Content>
      </Popover>
    );

    return (
      <OverlayTrigger trigger="click" placement="left" overlay={popover}>
        <Button
          variant="primary"
          className={styles.menu}
          onClick={() => {
            this.setState({ showPopover: !this.state.showPopover });
          }}
          ref={(button) => {
            this.button = button;
          }}
        >
          <Image src={filterUrl} fluid />
        </Button>
      </OverlayTrigger>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    startTime: state.timeline.startTime,
    endTime: state.timeline.endTime,
    classes: state.com.filter.objects,
    whitelistedResolutions: state.com.filter.whitelistedResolutions,
    minimumFramerate: state.com.filter.minFrameRate,
    includedClips: state.com.filter.includedClips,
    excludedClips: state.com.filter.excludedClips,

    availableResolutions: state.com.filter.resolutions,
    availableObjects: state.com.filter.availableObjects,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    getClipsMatchingFilter: () => dispatch(getClipsMatchingFilter()),
    getFilter: () => dispatch(getFilter()),
    modifyFilter: (a) => dispatch(modifyFilter(a)),
    changeMode: (incOrExc) =>
      dispatch(changeMode(INSPECTOR_MODE_EXLUDED_INCLUDED, incOrExc)),
    changeToInspector: () => dispatch(changeBrowserTab("inspectorBrowser")),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Filter);
