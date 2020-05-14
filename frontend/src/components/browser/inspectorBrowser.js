import React, { Component } from "react";
import { connect } from "react-redux";

//React Bootstrap components
import Table from "react-bootstrap/Table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";

// Import CSS
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
import {
  modifyFilter,
  getFilter,
  getClipsMatchingFilter,
} from "../../state/stateCommunication";

// Import utility
import {
  INCLUDED_CLIP_IDS,
  EXCLUDED_CLIP_IDS,
  doActionsInOrder,
  getDuplicatesTo,
  getOverlappingTo,
} from "../../util";
import { setLocation } from "../../state/stateMap";

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
    this.updateFilterList = this.updateFilterList.bind(this);
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
      }
    }

    return "";
  }

  // Move map if a new Camera, Clip or Area was selected
  componentDidUpdate(prevProps, prevState) {
    // Check if the object in inspector has changed
    if (
      this.props.inspector.mode !== prevProps.inspector.mode ||
      this.props.inspector.id !== prevProps.inspector.id
    ) {
      switch (this.props.inspector.mode) {
        case INSPECTOR_MODE_CAMERA:
          var cam = this.props.cameras[this.props.inspector.id];
          this.props.setMapLocation(
            cam.pos.latitude,
            cam.pos.longitude,
            this.props.mapZoom
          );
          return;
        case INSPECTOR_MODE_CLIP:
          var clip = this.props.clips[this.props.inspector.id];
          var cam = this.props.cameras[clip.camera];
          this.props.setMapLocation(
            cam.pos.latitude,
            cam.pos.longitude,
            this.props.mapZoom
          );
          return;
        case INSPECTOR_MODE_EXLUDED_INCLUDED:
          return;

        case INSPECTOR_MODE_AREA:
          var area = this.props.areas[this.props.inspector.id];
          this.props.setMapLocation(
            area.latitude,
            area.longitude,
            this.props.mapZoom
          );
          return;
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
    let clips = [];
    if (
      this.props.cameras[this.props.inspector.id] != undefined &&
      this.props.clips != undefined
    ) {
      this.props.cameras[this.props.inspector.id].clips.map((clipId) => {
        if (this.props.clips.hasOwnProperty(clipId)) {
          clips.push(this.props.clips[clipId]);
        }
      });
    }
    return clips;
  }

  /* Call to add or remove items from the include/exclude lists */
  updateFilterList(include, id) {
    // Update local lists
    if (include) this.props.updateInc(id);
    else this.props.updateExc(id);

    // Send lists to server
    doActionsInOrder([
      // Modify filter on server
      () => this.props.modifyFilter(this.props.incList, this.props.excList),
      // Fetch filter changes from server
      () => this.props.fetchFilter(),
    ]);
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
            onChange={() => this.updateFilterList(true, Number(clip.id))}
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
            onChange={() => this.updateFilterList(false, Number(clip.id))}
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

   Fetch a specific value based on the key. 
   */
  fetchObjectInDict(dict, objectId, key) {
    if (dict != undefined && objectId != undefined && key != undefined) {
      return dict[objectId][key];
    } else {
      return "";
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
          <Table striped bordered size="sm">
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
                <td>{clip.getPath(this.props.folders)}</td>
              </tr>
              <tr>
                <td>Format</td>
                <td>{clip.format ? clip.format : "Can't find format"}</td>
              </tr>
              {/* Fetch the resolution object from filter based on the clip:s resolution id.*/}
              <tr>
                <td>Resolution</td>
                <td>
                  {this.props.filter[clip.resolution]
                    ? this.props.filter[clip.resolution].height +
                      " x " +
                      this.props.filter[clip.resolution].width
                    : "Can't find resoluton"}
                </td>
              </tr>
              <tr>
                <td>Frame Rate</td>
                <td>
                  {clip.frameRate ? clip.frameRate : "Can't find frame rate"}
                </td>
              </tr>
              <tr>
                <td>Playable</td>
                <td>{clip.playable ? "Yes" : "No"}</td>
              </tr>
              <tr>
                <td>Overlapping</td>
                <td>
                  {getOverlappingTo(clip, this.props.clips).length > 0
                    ? "Yes"
                    : "No"}
                </td>
              </tr>
              <tr>
                <td>Duplicates</td>
                <td>
                  {getDuplicatesTo(clip, this.props.clips).length > 0
                    ? "Yes"
                    : "No"}
                </td>
              </tr>
              <tr>
                <td>Start Date</td>
                <td>
                  {clip.startTime.toDateString()
                    ? clip.startTime.toDateString()
                    : "Can't find date"}
                </td>
              </tr>
              <tr>
                <td>Start Time</td>
                <td>
                  {clip.startTime.toTimeString().slice(0, 8)
                    ? clip.startTime.toTimeString().slice(0, 8)
                    : "Can't find time"}
                </td>
              </tr>
              <tr>
                <td>End Date</td>
                <td>
                  {clip.endTime.toDateString()
                    ? clip.endTime.toDateString()
                    : "Can't find date"}
                </td>
              </tr>
              <tr>
                <td>End Time</td>
                <td>
                  {clip.endTime.toTimeString().slice(0, 8)
                    ? clip.endTime.toTimeString().slice(0, 8)
                    : "Can't find time"}
                </td>
              </tr>
              {clip.objectDetection ? (
                <tr>
                  <td>Detection Rate</td>
                  <td>{clip.objectDetection.rate + " sec"}</td>
                </tr>
              ) : (
                ""
              )}
            </tbody>
            {/* List all detected objects */}
            {clip.objectDetection ? (
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Occurrences</th>
                </tr>
                {Object.keys(clip.objectDetection.objects).length !== 0 ? (
                  Object.keys(clip.objectDetection.objects).map(
                    (objectClass) => (
                      <tr key={objectClass}>
                        <td>{objectClass}</td>
                        <td>{clip.objectDetection.objects[objectClass]}</td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <th>-</th>
                    <th>-</th>
                  </tr>
                )}
              </thead>
            ) : (
              ""
            )}
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
    filter: state.com.filter.resolutions,
    cameras: state.com.cameras,
    clips: state.com.clips,
    excList: state.browser.excList,
    incList: state.browser.incList,
    folders: state.com.folders,
    mapZoom: state.map.zoom,
    areas: state.com.filter.areas,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    setMapLocation: (lat, long, zoom) => dispatch(setLocation(lat, long, zoom)),
    changeMode: (mode, clipId) => dispatch(changeMode(mode, clipId)), //place selector
    updateExc: (clipId) => dispatch(updateList(false, clipId)),
    updateInc: (clipId) => dispatch(updateList(true, clipId)),
    modifyFilter: (il, el) =>
      dispatch(
        modifyFilter({ [INCLUDED_CLIP_IDS]: il, [EXCLUDED_CLIP_IDS]: el })
      ),
    fetchFilter: () => {
      dispatch(getFilter());
      dispatch(getClipsMatchingFilter());
    },
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(InspectorBrowser);
