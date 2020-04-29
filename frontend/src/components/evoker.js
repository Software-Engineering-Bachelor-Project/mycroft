import React, { Component } from "react";
import { connect } from "react-redux";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

// Actions
import {
  getProjects,
  newProject,
  deleteProject,
  renameProject,
  getClipsMatchingFilter,
  modifyFilter,
  getAreasInFilter,
  createArea,
  deleteArea,
  getFilterParams,
  getFilter,
  getCameras,
  getSequentialClip,
  getFolders,
  getSourceFolders,
  addFolder,
  removeFolder,
  getClips,
  detectObjects,
  getODProgress,
  deleteODProgress,
} from "../state/stateCommunication";

import { playClip, jump, play, pause } from "../state/statePlayer";
import { switchMode } from "../state/stateViewport";
import { changeMode, INSPECTOR_MODE_CAMERA } from "../state/stateBrowser";

/* -- Evoker -- */
class Evoker extends Component {
  render() {
    return (
      <div
        style={{
          position: "absolute",
          top: "5px",
          left: "100px",
          zIndex: 1,
        }}
      >
        {/* Drop down menu containing all actions to evoke */}
        <DropdownButton alignRight title="Evoke" id="dropdown-menu-align-right">
          {/* Project manager */}
          <Dropdown.Item onClick={() => this.props.getProjects()}>
            {" "}
            getProjects{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              var name = window.prompt("Name: ");
              this.props.newProject(name);
            }}
          >
            {" "}
            newProject{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              var id = parseInt(window.prompt("ID: "));
              return this.props.deleteProject(id);
            }}
          >
            {" "}
            deleteProject{" "}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              var id = parseInt(window.prompt("ID: "));
              var name = window.prompt("New name: ");
              return this.props.renameProject(id, name);
            }}
          >
            {" "}
            renameProject{" "}
          </Dropdown.Item>

          {/* Filter Module */}
          <Dropdown.Item
            onClick={() => {
              return this.props.getClipsMatchingFilter();
            }}
          >
            {" "}
            getClipsMatchingFilter{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.modifyFilter({
                start_time: new Date("2019-10-11"),
                end_time: new Date("2019-10-13"),
                whitelisted_resolutions: [1, 3],
                min_framerate: 42,
                included_clip_ids: [1],
                excluded_clip_ids: [3],
                classes: ["car"],
              });
            }}
          >
            {" "}
            modifyFilter{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.getAreasInFilter();
            }}
          >
            {" "}
            getAreasInFilter{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              let lat = window.prompt("latitude: ");
              let lon = window.prompt("longitude: ");
              let rad = parseInt(window.prompt("radius: "));
              return this.props.createArea(lat, lon, rad);
            }}
          >
            {" "}
            createArea{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              let id = parseInt(window.prompt("ID: "));
              return this.props.deleteArea(id);
            }}
          >
            {" "}
            deleteArea{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.getFilterParams();
            }}
          >
            {" "}
            getFilterParams{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.getFilter();
            }}
          >
            {" "}
            getFilter{" "}
          </Dropdown.Item>

          {/* Video manager */}
          <Dropdown.Item
            onClick={() => {
              return this.props.getCameras();
            }}
          >
            {" "}
            getCameras{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              var id = parseInt(window.prompt("ID: "));
              return this.props.getSequentialClip(id);
            }}
          >
            {" "}
            getSequentialClip{" "}
          </Dropdown.Item>

          {/* File manager */}
          <Dropdown.Item
            onClick={() => {
              return this.props.getFolders();
            }}
          >
            {" "}
            getFolders{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.getSourceFolders();
            }}
          >
            {" "}
            getSourceFolders{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              var fid = parseInt(window.prompt("FOLDER ID: "));
              return this.props.addFolder(fid);
            }}
          >
            {" "}
            addFolder{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              var fid = parseInt(window.prompt("FOLDER ID: "));
              return this.props.removeFolder(fid);
            }}
          >
            {" "}
            removeFolder{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.getClips();
            }}
          >
            {" "}
            getClips{" "}
          </Dropdown.Item>

          {/* Object detection */}
          <Dropdown.Item
            onClick={() => {
              return this.props.detectObjects(5, "filter");
            }}
          >
            {" "}
            detectObjects{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.getODProgress();
            }}
          >
            {" "}
            getODProgress{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.deleteODProgress();
            }}
          >
            {" "}
            deleteODProgress{" "}
          </Dropdown.Item>

          <Dropdown.Item
            onClick={() => {
              return this.props.switchMode();
            }}
          >
            {" "}
            switchMode{" "}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              return this.props.play();
            }}
          >
            {" "}
            play{" "}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              return this.props.pause();
            }}
          >
            {" "}
            pause{" "}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              var fid = parseInt(window.prompt("Seconds to jump "));
              return this.props.jump(fid);
            }}
          >
            {" "}
            jump{" "}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              var id = window.prompt("ID: ");
              this.props.playClip(id);
            }}
          >
            {" "}
            playClip{" "}
          </Dropdown.Item>
          <Dropdown.Item
            onClick={() => {
              var id = window.prompt("ID: ");
              this.props.changeMode(INSPECTOR_MODE_CAMERA, parseInt(id));
            }}
          >
            {" "}
            changeMode (camera){" "}
          </Dropdown.Item>
        </DropdownButton>

        {/* Log state */}
        <button onClick={() => this.props.logState()}> Log State </button>
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    logState: () => console.log(state),
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    getProjects: () => dispatch(getProjects()),
    newProject: (n) => dispatch(newProject(n)),
    deleteProject: (i) => dispatch(deleteProject(i)),
    renameProject: (i, n) => dispatch(renameProject(i, n)),
    getClipsMatchingFilter: () => dispatch(getClipsMatchingFilter()),
    modifyFilter: (obj) => dispatch(modifyFilter(obj)),
    getAreasInFilter: () => dispatch(getAreasInFilter()),
    createArea: (lat, lon, rad) => dispatch(createArea(lat, lon, rad)),
    deleteArea: (i) => dispatch(deleteArea(i)),
    getFilterParams: () => dispatch(getFilterParams()),
    getFilter: () => dispatch(getFilter()),
    getCameras: () => dispatch(getCameras()),
    getSequentialClip: (i) => dispatch(getSequentialClip(i)),
    getFolders: () => dispatch(getFolders()),
    getSourceFolders: () => dispatch(getSourceFolders()),
    addFolder: (i) => dispatch(addFolder(i)),
    removeFolder: (i) => dispatch(removeFolder(i)),
    getClips: () => dispatch(getClips()),
    detectObjects: (rate, target) => dispatch(detectObjects(rate, target)),
    getODProgress: () => dispatch(getODProgress()),
    deleteODProgress: () => dispatch(deleteODProgress()),
    playClip: (x) => dispatch(playClip(x)),
    switchMode: () => dispatch(switchMode()),
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    jump: (x) => dispatch(jump(x)),
    changeMode: (mode, id) => dispatch(changeMode(mode, id)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Evoker);
