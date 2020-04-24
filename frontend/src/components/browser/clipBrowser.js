import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "./browser.module.css";

import {
  changeMode,
  changeBrowserTab,
  INSPECTOR_MODE_CLIP,
  INSPECTOR_MODE_CAMERA,
} from "../../state/stateBrowser";

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
    console.log("Play clip with ID " + id);
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
                  {Object.values(camera.clips).map((clip) => (
                    <ListGroup key={clip.id} horizontal>
                      {/* Clip header */}
                      <ListGroup.Item
                        variant="warning"
                        style={{
                          width: "100%",
                        }}
                      >
                        {clip.name}
                        <Button
                          size="sm"
                          style={{
                            position: "absolute",
                            right: "1em",
                          }}
                          onClick={() => this.playClip(clip.id)}
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
                          this.props.inspectClip(clip.id);
                          this.props.changeTab("inspectorBrowser");
                        }}
                      >
                        i
                      </ListGroup.Item>
                    </ListGroup>
                  ))}
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
    cameras: state.browser.cameras,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    inspectCamera: (id) => dispatch(changeMode(INSPECTOR_MODE_CAMERA, id)),
    inspectClip: (id) => dispatch(changeMode(INSPECTOR_MODE_CLIP, id)),
    changeTab: (key) => dispatch(changeBrowserTab(key)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(ClipBrowser);
