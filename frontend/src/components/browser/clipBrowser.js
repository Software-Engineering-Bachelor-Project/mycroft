import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./browser.module.css";

import {
  changeMode,
  changeBrowserTab,
  INSPECTOR_MODE_CLIP,
  INSPECTOR_MODE_CAMERA,
} from "../../state/stateBrowser";

import { playClip, play } from "../../state/statePlayer";

// React Bootstrap
import ListGroup from "react-bootstrap/ListGroup";
import Collapse from "react-bootstrap/Collapse";
import Button from "react-bootstrap/Button";

/* -- Browser -- */
class ClipBrowser extends Component {
  constructor(props) {
    super(props);

    this.state = {
      cameras: {},
    };

    this.playClip = this.playClip.bind(this);
  }

  /**
   * This function is the callback for whenever the
   * play button of a specific clip was clicked.
   *
   * @param {Number} id The unique identifier of the clip to be played. Should be an integer.
   */
  playClip(id) {
    this.props.playClip(id);
    setTimeout(() => this.props.play(), 100);
  }

  /**
   * Checks whether or not the camera with the specified ID
   * has an expanded clip list or not.
   *
   * @param {Number} id The unique identifier of the camera whose clip list should be checked.
   * @return {boolean} true if the camera's clip list is expanded.
   */
  isToggled(id) {
    return id in this.state.cameras ? this.state.cameras[id] : false;
  }

  /**
   * Toggles the specified camera's clip list between collapsed and expanded.
   *
   * @param {Number} id The unique identifier of the camera whose clip list should be toggled.
   */
  toggle(id) {
    this.setState({
      cameras: {
        ...this.state.cameras,
        [id]: id in this.state.cameras ? !this.state.cameras[id] : true,
      },
    });
  }

  render() {
    return (
      <div className={styles.browserClip}>
        <ListGroup>
          {/* Iterate through cameras */}
          {/* TODO: CHECK IF CAMERAS ARE IN FILTER */}
          {Object.values(this.props.cameras).map((camera) => (
            <div key={camera.id}>
              {/* Camera item */}
              <ListGroup horizontal>
                {/* Camera header */}
                <ListGroup.Item
                  action
                  variant="success"
                  onClick={() => this.toggle(camera.id)}
                  aria-controls={"cam" + camera.id}
                  aria-expanded={this.isToggled(camera.id)}
                >
                  {camera.name}
                  <span
                    style={{
                      position: "absolute",
                      right: "1em",
                    }}
                  >
                    {Object.keys(camera.clips).length} clips
                  </span>
                </ListGroup.Item>

                {/* Camera inspect button */}
                <ListGroup.Item
                  action
                  variant="secondary"
                  className={styles.inspectHeader}
                  onClick={() => {
                    this.props.inspectCamera(camera.id);
                    this.props.changeTab("inspectorBrowser");
                  }}
                >
                  i
                </ListGroup.Item>
              </ListGroup>

              {/* Expandable list of clips */}
              <Collapse in={this.isToggled(camera.id)}>
                <ListGroup id={"cam" + camera.id}>
                  {/* Iterate through the clips of the current camera */}
                  {/* TODO: CHECK IF CLIPS ARE IN FILTER */}
                  {camera.clips.map((clipID) => {
                    if (this.props.clips[clipID] == undefined) return "";
                    return (
                      <ListGroup key={clipID} horizontal>
                        {/* Clip header */}
                        <ListGroup.Item
                          variant="warning"
                          style={{
                            width: "100%",
                          }}
                        >
                          {this.props.clips[clipID].name}
                          <Button
                            size="sm"
                            style={{
                              position: "absolute",
                              right: "1em",
                            }}
                            onClick={() => this.playClip(clipID)}
                            disabled={!this.props.clips[clipID].playable}
                            variant={
                              this.props.clips[clipID].playable
                                ? "primary"
                                : "secondary"
                            }
                          >
                            Play
                          </Button>
                        </ListGroup.Item>

                        {/* Clip item inspect button */}
                        <ListGroup.Item
                          action
                          variant="secondary"
                          className={styles.inspectHeader}
                          onClick={() => {
                            this.props.inspectClip(clipID);
                            this.props.changeTab("inspectorBrowser");
                          }}
                        >
                          i
                        </ListGroup.Item>
                      </ListGroup>
                    );
                  })}
                </ListGroup>
              </Collapse>
            </div>
          ))}
        </ListGroup>
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    cameras: state.com.cameras,
    clips: state.com.clips,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    inspectCamera: (id) => dispatch(changeMode(INSPECTOR_MODE_CAMERA, id)),
    inspectClip: (id) => dispatch(changeMode(INSPECTOR_MODE_CLIP, id)),
    changeTab: (key) => dispatch(changeBrowserTab(key)),
    playClip: (id) => dispatch(playClip(id)),
    play: () => dispatch(play()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(ClipBrowser);
