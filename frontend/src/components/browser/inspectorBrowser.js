import React, { Component } from "react";
import { connect } from "react-redux";

//React Bootstrap components
import {
  OverlayTrigger,
  Tooltip,
  ListGroup,
  Col,
  Form,
  Table,
  Row,
  Button,
  Image,
} from "react-bootstrap";

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
import infoIcon from "../../images/info-icon.png";
import deleteIcon from "../../images/delete-icon.png";

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
    this.fetchClips = this.fetchClips.bind(this);
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
        <Form>
          <Form.Label className={styles.browserInspectorHeader}>
            Camera
          </Form.Label>
          <Form.Label className={styles.browserInspectorHeader}>
            {this.props.cameras[this.props.inspector.id].name}
          </Form.Label>
          {/* Displays the headings for the different type of contents*/}
          <Row className={styles.inspectorCameraColumnHeader}>
            {/*Render name header*/}
            <p className={styles.inspectorCameraNameColumn}>Name</p>
            {/*Render Include Clip header with tooltip*/}
            <OverlayTrigger
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-name`}>
                  Always <strong>include</strong> the Clip in the filter, it
                  will always match the Filter no matter the parameters
                </Tooltip>
              }
            >
              <p className={styles.inspectorCameraInclExclColumn}>Incl</p>
            </OverlayTrigger>{" "}
            {/*Render Exclude Clip header with tooltip*/}
            <OverlayTrigger
              placement={"left"}
              overlay={
                <Tooltip id={`tooltip-name`}>
                  Always <strong>exclude</strong> the Clip from the filter, it
                  will never match the Filter no matter the parameters
                </Tooltip>
              }
            >
              <p className={styles.inspectorCameraInclExclColumn}>Excl</p>
            </OverlayTrigger>{" "}
            {/*Render Empty space For Info button, need to be done to position the other headers correctly*/}
            <p className={styles.inspectorCameraInfoColumn}></p>
          </Row>

          {/* Show content for each clip belonging to the camera */}
          {Object.values(validClips).map((clip) =>
            this.renderCameraContent(clip)
          )}
        </Form>
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
      <ListGroup
        horizontal
        key={clip.id}
        className={[styles.inspectorCameraClipRow].join(" ")}
      >
        {/*Render name with tooltip*/}
        <OverlayTrigger
          placement={"left"}
          overlay={<Tooltip id={`tooltip-name`}>{clip.name}</Tooltip>}
        >
          <ListGroup.Item
            className={[
              styles.inspectorCameraNameColumn,
              styles.inspectorCameraNameItem,
            ].join(" ")}
          >
            {" "}
            {clip.name}{" "}
          </ListGroup.Item>
        </OverlayTrigger>{" "}
        {/*Render Include Clip Checkbox*/}
        <ListGroup.Item
          className={[
            styles.inspectorCameraInclExclColumn,
            styles.inspectorCameraInclExclItem,
          ].join(" ")}
        >
          <Form.Check
            type={"checkbox"}
            checked={this.checkCheckbox(true, Number(clip.id))}
            onChange={() => this.updateFilterList(true, Number(clip.id))}
          />
        </ListGroup.Item>
        {/*Render Exclude Clip Checkbox*/}
        <ListGroup.Item
          className={[
            styles.inspectorCameraInclExclColumn,
            styles.inspectorCameraInclExclItem,
          ].join(" ")}
        >
          <Form.Check
            type={"checkbox"}
            checked={this.checkCheckbox(false, Number(clip.id))}
            onChange={() => this.updateFilterList(false, Number(clip.id))}
          />
        </ListGroup.Item>
        {/*Render Info button*/}
        <ListGroup.Item
          className={[
            styles.inspectorCameraInfoColumn,
            styles.inspectorCameraInfoItem,
          ].join(" ")}
          action
          variant="secondary"
          onClick={() => {
            this.props.changeMode(INSPECTOR_MODE_CLIP, clip.id);
          }}
        >
          i
        </ListGroup.Item>
      </ListGroup>
    );
  }

  /*
  Fetch selected clip based on the chosen clip.id.
  */
  fetchSelectedClip(clipId) {
    if (this.props.inspector.id == undefined) {
      return "";
    }

    if (!this.props.clips.hasOwnProperty(clipId)) {
      console.warn("Id ", clipId, " does match with a clip");
      return undefined;
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
    if (
      this.props.inspector != undefined &&
      this.props.clips != undefined &&
      this.props.inspector.id != undefined
    ) {
      let clip = this.fetchSelectedClip(this.props.inspector.id);
      if (clip == undefined) return "";
      return (
        <div>
          {/* Displays heading for the clip mode and selected clip*/}
          <p className={styles.browserInspectorHeader}>Clip</p>
          <p className={styles.browserInspectorHeader}>{clip.name}</p>
          {/* Displays info of the seleceted clip*/}
          <Table
            striped
            bordered
            size="sm"
            className={styles.browserInspectorTable}
          >
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

  /* Fetch clips based on all clip Id:s in included or excluded list */
  fetchClips(clipIdList) {
    var clips = [];
    if (clipIdList.length != 0) {
      clipIdList.map((clipId) => {
        if (this.props.clips.hasOwnProperty(clipId)) {
          Object.values(this.props.clips).map((clip) => {
            if (clip.id == clipId) {
              clips.push(clip);
            }
          });
        }
      });
    }
    return clips;
  }

  /* Render the excluded and included mode displayed in inspector */
  renderExcludedIncluded() {
    var filteredList = [];
    var include = false;
    var inspectorHeader = "";

    /* Updates local variables with info about included mode */
    if (this.props.inspector.id == 0) {
      filteredList = this.props.incList;
      include = true;
      inspectorHeader = "Included clips";
    } else {
      /* Updates local variables with info about excluded mode */
      filteredList = this.props.excList;
      include = false;
      inspectorHeader = "Excluded clips";
    }

    /* Fetch clips based on included or excluded clips */
    var clips = this.fetchClips(filteredList);
    /* Render selected mode */
    return (
      <div>
        <ListGroup id={"filtered"}>
          <p className={styles.browserInspectorHeader}>{inspectorHeader}</p>
          {Object.values(clips).map((clip) => {
            return (
              <ListGroup key={clip.id} horizontal>
                {/* Render clip name */}
                <ListGroup.Item
                  variant="secondary"
                  className={styles.browserButton}
                  style={{ width: "100%" }}
                >
                  {clip.name}
                </ListGroup.Item>
                {/* Render info button */}
                <ListGroup.Item
                  variant="info"
                  action
                  onClick={() => {
                    this.props.changeMode(INSPECTOR_MODE_CLIP, clip.id);
                  }}
                >
                  <Image src={infoIcon} fluid />
                </ListGroup.Item>
                {/* Render delete button */}
                <ListGroup.Item
                  action
                  variant="danger"
                  onClick={() => {
                    this.updateFilterList(include, clip.id);
                  }}
                >
                  <Image src={deleteIcon} fluid />
                </ListGroup.Item>
              </ListGroup>
            );
          })}
        </ListGroup>
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
      <div className={styles.browserInspector}>
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
    filteredClips: state.com.filter,
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
