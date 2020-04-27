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
        </DropdownButton>

        {/* Log state */}
        <button onClick={() => this.props.logState()}> Log State </button>
      </div>
    );
  }
}

// Map Redux states to React props
const menuStateToProps = (state) => {
  return {
    logState: () => console.log(state),
  };
};

// Forward Redux's dispatch function to React props
const menuDispatchToProps = (dispatch) => {
  return {
    getProjects: () => dispatch(getProjects()),
    newProject: (n) => dispatch(newProject(n)),
    deleteProject: (i) => dispatch(deleteProject(i)),
    renameProject: (i, n) => dispatch(renameProject(i, n)),
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
  };
};

// Connect Redux with React
export default connect(menuStateToProps, menuDispatchToProps)(Evoker);
