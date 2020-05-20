import React, { Component } from "react";
import { connect } from "react-redux";

//import css
import styles from "./timeline.module.css";

//import actions
import { zoom } from "../../state/stateTimeline";
import { playClip, play, jump } from "../../state/statePlayer";
import {
  changeMode,
  changeBrowserTab,
  INSPECTOR_MODE_CLIP,
} from "../../state/stateBrowser";

// Color list for clips
const COLOR_LIST = [
  /*"#62b8d9", //blue [light]
  "#4dc24b", //green [dark]
  "#dc3a2a", //red [dark]
  "#f4d052", //yellow [light]
  "#cb49dc", //purple [dark]
  "#abde5e", //light green [light]
  "#4e57ca", //dark blue [dark]
  "#f97a1c", //orange [light]*/

  //different order
  /*"#cb49dc", //purple [dark]
  "#4e57ca", //dark blue [dark]
  "#62b8d9", //blue [light]
  "#4dc24b", //green [dark]
  "#abde5e", //light green [light]
  "#f4d052", //yellow [light]
  "#f97a1c", //orange [light]
  "#dc3a2a", //red [dark]*/

  //different colors
  "#86307d", //purple [dark]
  "#155e8a", //dark blue [dark]
  "#34bbe6", //blue [light]
  "#3aa541", //green [dark]
  "#a3e048", //light green [light]
  "#f6f837", //yellow [light]
  "#ef800d", //orange [light]
  "#d4201a", //red [dark]
];

/**
 * This class respresents the Cliplines component.
 */
class Cliplines extends Component {
  constructor(props) {
    super(props);
    this.getLeftPosition = this.getLeftPosition.bind(this);
    this.getWidthOfClip = this.getWidthOfClip.bind(this);
    this.handleClipSelection = this.handleClipSelection.bind(this);

    // Updates scale when switching to Player-mode
    this.props.zoom(undefined, this.props.viewportMode);
  }

  /**
   * Calculates the left positioning of clip.
   * This will assume that all the clips are inside the startTime and endTime of glassbox.
   *
   * @param {Date} clipStartTime the clip start time
   */
  getLeftPosition(clipStartTime) {
    var start = Math.max(
      this.props.gbStartTime.getTime(),
      clipStartTime.getTime()
    );
    return (
      ((start - this.props.gbStartTime.getTime()) / this.props.gbTimeSpan) * 100
    );
  }

  /**
   * Calculates the width of the clip.
   * This will assume that all the clips are inside the startTime and endTime of glassbox.
   *
   * @param {Date} clipStartTime the clip start time
   * @param {Date} clipEndTime the clip end time
   */
  getWidthOfClip(clipStartTime, clipEndTime) {
    var end = Math.min(this.props.gbEndTime.getTime(), clipEndTime.getTime());
    if (end < clipStartTime.getTime()) {
      console.error(
        "RangeError: in cliplines.js, getWidthOfClip(): clipEndTime before clipStartTime"
      );
      return 0;
    }
    let timeWidth =
      end - Math.max(clipStartTime.getTime(), this.props.gbStartTime.getTime());
    return (timeWidth / this.props.gbTimeSpan) * 100;
  }

  /**
   * This function handles the onClick event on each clipline.
   * The clip will be played, also the right tab will be selected
   * in the browser, with the inspector of the clip open.
   *
   * @param {int} id
   */
  handleClipSelection(id) {
    this.props.changeMode(INSPECTOR_MODE_CLIP, id);
    this.props.changeBrowserTab();

    if (!this.props.clips[id].playable) return;
    this.props.playClip(id);
    setTimeout(() => this.props.play(), 100);

    // Chack if clip is outside glassbox, if so start the clip from startTime of glassbox
    let clipStart = this.props.clips[id].startTime.getTime();
    let gbStart = this.props.gbStartTime.getTime();
    if (clipStart < gbStart) this.props.jump((gbStart - clipStart) / 1000);
  }

  render() {
    return (
      <div
        className={styles.cliplineContainer}
        onScroll={() => {
          this.props.rerenderParentCallback();
        }}
      >
        {/* Iterate through cameras in filter */}
        {this.props.filterCameras.map((cameraID, i) => {
          /* Check if camera exists */
          if (!(cameraID in this.props.cameras)) return "";
          return (
            <div
              key={cameraID}
              className={styles.cliplineCamera}
              style={{
                backgroundColor:
                  COLOR_LIST[i % COLOR_LIST.length] +
                  (this.props.cameras[cameraID].clips.includes(
                    this.props.clipID
                  )
                    ? "70"
                    : "20"),
                top: 25 + (15 + 12) * i + "px",
              }}
            >
              {/* Iterate through the clips of the current camera */}
              {this.props.cameras[cameraID].clips.map((clipID) => {
                /* Check if clip exists in filter */
                if (!this.props.filterClips.includes(clipID)) return "";
                /* Check if clip exists */
                if (!(clipID in this.props.clips)) {
                  console.warn(
                    "Clip with id ",
                    clipID,
                    " does not exist in current project"
                  );
                  return "";
                }
                return (
                  <div
                    key={clipID}
                    className={styles.cliplineClip}
                    style={{
                      backgroundColor: this.props.clips[clipID].playable
                        ? COLOR_LIST[i % COLOR_LIST.length]
                        : "#6c757d",
                      width:
                        this.getWidthOfClip(
                          this.props.clips[clipID].startTime,
                          this.props.clips[clipID].endTime
                        ) + "%",
                      left:
                        this.getLeftPosition(
                          this.props.clips[clipID].startTime
                        ) + "%",
                      cursor: this.props.clips[clipID].playable
                        ? "pointer"
                        : "not-allowed",
                    }}
                    onClick={() => this.handleClipSelection(clipID)}
                  ></div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}

//Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    timeSpan: state.timeline.timeSpan,
    scale: state.timeline.scale,

    gbTimeSpan: state.timeline.glassbox.timeSpan,
    gbStartTime: state.timeline.glassbox.startTime,
    gbEndTime: state.timeline.glassbox.endTime,

    cameras: state.com.cameras,
    clips: state.com.clips,
    filterCameras: state.com.filter.cameras,
    filterClips: state.com.filter.clips,

    clipID: state.player.clipID,
  };
};

//Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    zoom: (hrs, viewportMode) => dispatch(zoom(hrs, viewportMode)),
    playClip: (id) => dispatch(playClip(id)),
    play: () => dispatch(play()),
    changeMode: (mode, id) => dispatch(changeMode(mode, id)),
    changeBrowserTab: () => dispatch(changeBrowserTab("inspectorBrowser")),
    jump: (timeDelta) => dispatch(jump(timeDelta)),
  };
};

//Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Cliplines);
