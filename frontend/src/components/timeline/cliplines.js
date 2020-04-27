import React, { Component } from "react";
import { connect } from "react-redux";

//import functions
import { addCamera, removeCamera } from "../../state/stateTimeline";

//import css
import styles from "./timeline.module.css";

// import class
import { Camera, Clip } from "../../types";

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
  }

  /**
   * Calculates the left positioning of clip.
   *
   * @param {Date} clipStartTime the clip start time
   */
  getLeftPosition(clipStartTime) {
    var start = Math.max(
      this.props.gbStartTime.getTime(),
      clipStartTime.getTime()
    );
    return (
      ((start - this.props.gbStartTime.getTime()) / this.props.timeSpan) * 100
    );
  }

  /**
   * Calculates the width of the clip.
   *
   * @param {Date} clipStartTime the clip start time
   * @param {Date} clipEndTime the clip end time
   */
  getWidthOfClip(clipStartTime, clipEndTime) {
    var end = Math.min(this.props.gbEndTime.getTime(), clipEndTime.getTime());
    return (
      ((end - clipStartTime.getTime()) / (60 * 60 * 1000) / this.props.scale) *
      100
    );
  }

  render() {
    return (
      <div>
        {/* Iterate through cameras */}
        {Object.values(this.props.cameras).map((camera, i) => (
          <div key={camera.id}>
            {/* Iterate through the clips of the current camera */}
            {Object.values(camera.clips).map((clip) => (
              <div
                key={clip.id}
                className={styles.cliplines}
                style={{
                  backgroundColor: COLOR_LIST[i % COLOR_LIST.length],
                  width:
                    this.getWidthOfClip(clip.startTime, clip.endTime) + "%",
                  left: this.getLeftPosition(clip.startTime) + "%",
                }}
              ></div>
            ))}
          </div>
        ))}
      </div>
    );
  }
}

//Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    timeSpan: state.timeline.timeSpan,
    scale: state.timeline.scale,
    cameras: state.timeline.cameras,
    gbTimeSpan: state.timeline.glassbox.timeSpan,
    gbStartTime: state.timeline.glassbox.startTime,
    gbEndTime: state.timeline.glassbox.endTime,
  };
};

//Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

//Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Cliplines);
