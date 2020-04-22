import React, { Component } from "react";
import { connect } from "react-redux";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { zoom } from "../../state/stateTimeline";

import styles from "./timeline.module.css";

import Glassbox from "./glassbox";

/**
 * This function returns a list of line placements in percents.
 * Example: ["20%", "40%", "60%", "80%"]
 *
 * @param {Date} startTime The start date of timeline
 * @param {int} timeSpan The time span from startTime to endTime.
 * @return {Array} List of line placements.
 */
export function getLinePlacements(startTime, timeSpan) {
  var totalHrs = timeSpan / (60 * 60 * 1000);
  var step = 100 / totalHrs;
  var mintuesOffset = startTime.getMinutes();
  var secondOffset = startTime.getSeconds();
  var hrsOffset = (mintuesOffset * 60 + secondOffset) / (60 * 60);
  var percentOffset = (hrsOffset / totalHrs) * 100;

  if (totalHrs <= 1) {
    return [];
  }
  var list_ = new Array();
  for (var j = 1; j < totalHrs; j++) {
    list_.push(step * j - percentOffset + "%");
  }
  return list_;
}

// Scaling options for the dropdown menu
const SCALE_LIST = [12, 24, 36, 48];

/**
 * This class respresents the timeline react-component.
 */
class Timeline extends Component {
  render() {
    return (
      <div className={styles.main}>
        {/* This is the div for the topbar which contains the dropdown menu(s) */}
        <div className={styles.topbar}>
          {/* Dropdown menu for scaling the timeline */}
          <DropdownButton
            className={styles.dropdown}
            title={this.props.scale + " Hours"}
          >
            {/* Create dropdown items for every scaling option */}
            {SCALE_LIST.map((hrs) => {
              return (
                <Dropdown.Item onClick={(a) => this.props.zoom(hrs)} key={hrs}>
                  {hrs + " Hours"}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </div>

        {/* This is the box containing all the timestamps, which is affected by scaling */}
        <div className={styles.sliderbox}>
          <div
            className={styles.slider}
            style={{
              width:
                ((this.props.endTime.getTime() -
                  this.props.startTime.getTime()) /
                  (60 * 60 * 1000) /
                  this.props.scale) *
                  100 +
                "%",
            }}
          >
            <div className={styles.day}>
              <div className={styles.date}>Apr 17</div>
            </div>

            {/* Glassbox component */}
            <Glassbox />

            {/* Creates a line for each timestamp and draws out hours*/}
            {getLinePlacements(this.props.startTime, this.props.timeSpan).map(
              (p, i) => {
                return (
                  <div
                    style={{
                      position: "absolute",
                      left: p,
                      top: "0",
                      height: "100%",
                    }}
                    key={p}
                  >
                    <div className={styles.line}> </div>
                    <div
                      style={{
                        position: "absolute",
                        left: "5px",
                        bottom: "2px",
                      }}
                    >
                      {(this.props.startTime.getHours() + i + 1) % 24}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    );
  }
}

//Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    startTime: state.timeline.startTime,
    endTime: state.timeline.endTime,
    scale: state.timeline.scale,
    timeSpan: state.timeline.timeSpan,
    startTime: state.timeline.startTime,
  };
};

//Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    zoom: (hrs) => dispatch(zoom(hrs)),
  };
};

//Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
