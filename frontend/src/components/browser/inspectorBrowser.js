import React, { Component } from "react";
import { connect } from "react-redux";

//React Bootstrap components
import Tooltip from "react-bootstrap/Tooltip";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

import ListGroup from "react-bootstrap/ListGroup";

// Import relevant components
import styles from "./browser.module.css";

// Import state
import {
  changeMode,
  updateList,
  INSPECTOR_MODE_AREA,
  INSPECTOR_MODE_CLIP,
  INSPECTOR_MODE_CAMERA,
  INSPECTOR_MODE_EXLUDED_INCLUDED,
} from "../../state/stateBrowser";
import { modifyFilter } from "../../state/stateCommunication";

/* -- Browser -- */
class InspectorBrowser extends Component {
  constructor(props) {
    super(props);

    this.displayMode = this.displayMode.bind(this);
    this.renderClip = this.renderClip.bind(this);
    this.renderCamera = this.renderCamera.bind(this);
    this.renderExcludedIncluded = this.renderExcludedIncluded.bind(this);
    this.renderArea = this.renderArea.bind(this);
    this.checkCheckbox = this.checkCheckbox.bind(this);
    this.isEmpty = this.isEmpty.bind(this);
    this.renderCameraContent = this.renderCameraContent.bind(this);
    this.fetchValidClips = this.fetchValidClips.bind(this);
    this.fetchSelectedClip = this.fetchSelectedClip.bind(this);
    this.fetchObjectInDict = this.fetchObjectInDict.bind(this);
    this.fetchClipPropertyValue = this.fetchClipPropertyValue.bind(this);
    this.fetchClipTimeValue = this.fetchClipTimeValue.bind(this);
  }

  /* Checks if an object in empty */
  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  /* Checks which mode is selected to be displayed in inspector */
  displayMode(mode) {
    if (
      !this.isEmpty(this.props.cameras) &&
      !this.isEmpty(this.props.clips) &&
      this.props.inspector.id != -1
    ) {
      switch (mode) {
        case INSPECTOR_MODE_CAMERA:
          return this.renderCamera();
        case INSPECTOR_MODE_CLIP:
          return this.renderClip();
        case INSPECTOR_MODE_EXLUDED_INCLUDED:
          return this.renderExcludedIncluded();
        case INSPECTOR_MODE_AREA:
          return this.renderArea();
        default:
          return "";
      }
    }
  }

  /* checks */
  checkCheckbox(include, clipId) {
    if (clipId != undefined) {
      let tempList = include ? this.props.incList : this.props.excList;
      return tempList.includes(clipId);
    } else {
      return false;
    }
  }

  /* Render the camera mode displayed in inspector */
  renderCamera() {
    if (this.props.cameras[this.props.inspector.id] == undefined) {
      alert("Invalid camera selected");
      console.log("Invalid camera selected");
      return "";
    } else {
      let validClips = this.fetchValidClips();
      return (
        <div>
          {/* Displays heading for the camera mode and selected camera*/}
          <Form>
            <Form.Label className={styles.browserInspectorHeader}>
              Camera
            </Form.Label>
            <Form.Label className={styles.browserInspectorHeader}>
              {this.props.cameras[this.props.inspector.id].name}
            </Form.Label>
            {/* Displays the headings for the different type of contents*/}
            <Form.Row>
              <Col className={styles.browserInspectorItem}>
                <Form.Label>Name</Form.Label>
              </Col>
              <Col className={styles.browserInspectorItem}>
                <Form.Label>Inc</Form.Label>
              </Col>
              <Col className={styles.browserInspectorItem}>
                <Form.Label>Exc</Form.Label>
              </Col>
              <Col className={styles.browserInspectorItem}>
                <Form.Label></Form.Label>
              </Col>
            </Form.Row>
            {/* Show content for each clip belonging to the camera */}
            {Object.values(validClips).map((clip) =>
              this.renderCameraContent(clip)
            )}
          </Form>
        </div>
      );
    }
  }

  /* fetch all valid clips based on the selected camera(=inspector.id)
      By getting all the clipId´s in the selected camera, the function
      can iterate through the list of clips and get all clips that belongs
      to the specific camera.
  */
  fetchValidClips() {
    if (
      this.props.cameras[this.props.inspector.id] != undefined ||
      this.props.clips != undefined
    ) {
      let clips = [];
      this.props.cameras[this.props.inspector.id].clips.map((clipId) => {
        if (this.props.clips.hasOwnProperty(clipId)) {
          clips.push(this.props.clips[clipId]);
        }
      });
      return clips;
    } else {
      return "";
    }
  }

  /* Render content for the camera mode display in inspector */
  renderCameraContent(clip) {
    return (
      <Form.Row key={clip.id}>
        {/* Displays the clip name */}
        <Col className={styles.browserInspectorItem}>{clip.name}</Col>

        {/* Render checkbox if clip is included */}
        <Col className={styles.browserInspectorItem}>
          <input
            type="checkbox"
            className={styles.browserInspectorBigCheckbox}
            name="included"
            id={clip.id}
            checked={this.checkCheckbox(true, Number(clip.id))}
            onChange={(e) => this.props.updateInc(Number(clip.id))}
          ></input>
        </Col>

        {/* render checkbox if clip is excluded */}
        <Col className={styles.browserInspectorItem}>
          <input
            type="checkbox"
            className={styles.browserInspectorBigCheckbox}
            name="excluded"
            id={clip.id}
            checked={this.checkCheckbox(false, Number(clip.id))}
            onChange={(e) => this.props.updateExc(Number(clip.id))}
          ></input>
        </Col>

        {/* Render button to inspect the specific clip in INSPECTOR_MODE_CLIP */}
        <Col className={styles.browserInspectorItem}>
          <ListGroup>
            <ListGroup.Item
              action
              variant="secondary"
              className={styles.inspectHeader}
              onClick={() => {
                this.props.changeMode(INSPECTOR_MODE_CLIP, clip.id);
              }}
            >
              i
            </ListGroup.Item>
          </ListGroup>
        </Col>
      </Form.Row>
    );
  }

  /* 
  Fetch selected clip based on the chosen clip.id.
  */
  fetchSelectedClip(clipId) {
    if (this.props.inspector.id == undefined) {
      return "";
    }

    if (!this.props.clips[clipId]) {
      console.warn("Id ", clipID, " does match with a clip");
      return "";
    } else {
      return this.props.clips[clipId];
    }
  }

  /**
   * @param {Object[int, list]} dict A list of objects. 
   * @param {int} objectId The id for the asked object.
   * @param {string} key The key for which value should be returned. 

   Fetch a specific value based on the key. First finds the matching object
   with the objectId. Afterwords returning the value of the key. 
   */
  fetchObjectInDict(dict, objectId, key) {
    if (dict != undefined && objectId != undefined && key != undefined) {
      let res = "";
      Object.values(dict).map((obj) => {
        if (Object.is(obj.id, objectId)) {
          res = obj;
        }
      });
      return res[key];
    } else {
      return "";
    }
  }

  fetchClipPropertyValue(clip, property) {
    if (clip[property] || property != undefined) {
      switch (property) {
        case "playable":
          return clip[property] ? "Yes" : "No";
        default:
          return clip[property];
      }
    } else {
      return "Cant find " + property;
    }
  }

  fetchClipTimeValue(clip, property, timeType) {
    if (
      timeType != undefined &&
      clip[property] != undefined &&
      property != undefined
    ) {
      switch (timeType) {
        case "date":
          if (clip[property].toDateString() != undefined) {
            return clip[property].toDateString();
          } else {
            return "Cant find " + timeType;
          }
        case "time":
          if (clip[property].toTimeString() != undefined) {
            return clip[property].toTimeString().slice(0, 8);
          } else {
            return "Cant find " + timeType;
          }
        default:
          return "Cant find " + timeType;
      }
    } else {
      return "Cant find " + timeType;
    }
  }

  /* Render the clip mode displayed in inspector */
  renderClip() {
    if (this.props.inspector != undefined && this.props.clips != undefined) {
      let clip = this.fetchSelectedClip(this.props.inspector.id);
      return (
        <div>
          {/* Displays heading for the clip mode and selected clip*/}
          <p className={styles.browserInspectorHeader}>Clip</p>
          <p className={styles.browserInspectorHeader}>{clip.name}</p>
          {/* Displays info of the seleceted clip*/}
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>Category</th>
                <th>Info</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Camera</td>
                <td>
                  {this.fetchObjectInDict(
                    this.props.cameras,
                    clip.camera,
                    "name"
                  )}
                </td>
              </tr>
              <tr>
                <td>Folder</td>
                <td>
                  {this.fetchObjectInDict(
                    this.props.folders,
                    clip.folder,
                    "name"
                  )}
                </td>
              </tr>
              <tr>
                <td>Format</td>
                <td>{this.fetchClipPropertyValue(clip, "format")}</td>
              </tr>
              <tr>
                <td>Resolution</td>
                <td>{this.fetchClipPropertyValue(clip, "resolution")}</td>
              </tr>
              <tr>
                <td>Framerate</td>
                <td>{this.fetchClipPropertyValue(clip, "frame_rate")}</td>
              </tr>
              <tr>
                <td>Playable</td>
                <td>{this.fetchClipPropertyValue(clip, "playable")}</td>
              </tr>
              <tr>
                <td>Start Date</td>
                <td>{this.fetchClipTimeValue(clip, "startTime", "date")}</td>
              </tr>
              <tr>
                <td>Start Time</td>
                <td>{this.fetchClipTimeValue(clip, "startTime", "time")}</td>
              </tr>
              <tr>
                <td>End Date</td>
                <td>{this.fetchClipTimeValue(clip, "endTime", "date")}</td>
              </tr>
              <tr>
                <td>End Time</td>
                <td>{this.fetchClipTimeValue(clip, "endTime", "time")}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      );
    } else {
      return "";
    }
  }

  /* Render the excluded and included mode displayed in inspector */
  renderExcludedIncluded() {
    return (
      <div>
        <h3 className={styles.browserInspectorHeader}>Selected clips</h3>
      </div>
    );
  }

  /* Render the area mode displayed in inspector */
  renderArea() {
    return (
      <div>
        <h3 className={styles.browserInspectorHeader}>Area</h3>
      </div>
    );
  }

  /* Render the inspector */
  render() {
    return (
      <div className={styles.main}>
        {this.displayMode(this.props.inspector.mode)}
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    inspector: state.browser.inspector,
    cameras: state.com.cameras,
    clips: state.com.clips,
    excList: state.browser.excList,
    incList: state.browser.incList,
    folders: state.com.folders,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    changeMode: (mode, clipId) => dispatch(changeMode(mode, clipId)), //place selector
    updateExc: (clipId) => dispatch(updateList(false, clipId)),
    updateInc: (clipId) => dispatch(updateList(true, clipId)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(InspectorBrowser);
