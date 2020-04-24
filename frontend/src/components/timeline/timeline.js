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
  for (var j = 1; j < totalHrs + hrsOffset; j++) {
    list_.push(step * j - percentOffset + "%");
  }
  return list_;
}

/**
 * This function returns all information needed to draw out dates to days
 *
 * @param {Date} startTime The start date of timeline
 * @param {Date} endTime The end date of timeline
 * @param {int} timeSpan The time span from startTime to endTime
 * @return {Array[Array]} List of Lists containing width, position and date of a given day
 */
export function getDayPlacements(startTime, endTime, timeSpan) {
  //Constants:
  const dayInSec = 60 * 60 * 24;

  //Create convenient constants for different units of timeSpan
  const totalSec = timeSpan / 1000;
  const totalDays = totalSec / dayInSec;

  //Create list
  var list_ = new Array();

  //Date variable to increment
  var currentDate = new Date(startTime.getTime());

  //Variable to decrement in loop
  var secLeft = totalSec;

  //Edge case if startTime and endTime are within the same day
  if (totalDays <= 1 && startTime.getDay() == endTime.getDay()) {
    list_.push(["100%", "0%", getDateString(currentDate)]);
    return list_;
  }

  //Get length of first day in seconds
  var firstDay =
    dayInSec -
    (startTime.getHours() * 60 * 60 +
      startTime.getMinutes() * 60 +
      startTime.getSeconds());

  //Get length of last day in seconds
  var lastDay =
    endTime.getHours() * 60 * 60 +
    endTime.getMinutes() * 60 +
    endTime.getSeconds();

  if (lastDay == 0) {
    lastDay = 24 * 60 * 60;
  }

  //Get sizes in percentages
  var firstDaySize = (100 * firstDay) / totalSec;
  var lastDaySize = (100 * lastDay) / totalSec;
  var daySize = (100 * dayInSec) / totalSec;

  //Add width, position and date string of first day to list
  list_.push([firstDaySize + "%", "0%", getDateString(currentDate)]);
  secLeft = secLeft - firstDay;

  //Set currentDate to next day
  currentDate.setDate(currentDate.getDate() + 1);
  var pos = firstDaySize;

  //Add width, position and date string to all days between first and last
  while (secLeft > dayInSec) {
    list_.push([daySize + "%", pos + "%", getDateString(currentDate)]);
    currentDate.setDate(currentDate.getDate() + 1);
    pos = pos + daySize;
    secLeft = secLeft - dayInSec;
  }

  //Add width, position and date string of last day
  list_.push([lastDaySize + "%", pos + "%", getDateString(currentDate)]);
  return list_;
}

/**
 * This function takes a date and returns a string version of it
 *
 * @param {Date} date Date to be converted into string
 * @return {String} Date converted to string
 */
export function getDateString(date) {
  let month = date.getMonth();
  let day = date.getDate();

  switch (month) {
    case 0:
      return "Jan " + day;
    case 1:
      return "Feb " + day;
    case 2:
      return "Mar " + day;
    case 3:
      return "Apr " + day;
    case 4:
      return "May " + day;
    case 5:
      return "Jun " + day;
    case 6:
      return "Jul " + day;
    case 7:
      return "Aug " + day;
    case 8:
      return "Sep " + day;
    case 9:
      return "Oct " + day;
    case 10:
      return "Nov " + day;
    case 11:
      return "Dec " + day;
  }
}

// Scaling options for the dropdown menu
const SCALE_LIST = [12, 24, 36, 48];

/**
 * This class respresents the timeline react-component.
 */
class Timeline extends Component {
  constructor(props) {
    super(props);
    this.renderScaleList = this.renderScaleList.bind(this);
    this.renderTimestamps = this.renderTimestamps.bind(this);
    this.getWidthOfTimeline = this.getWidthOfTimeline.bind(this);
  }

  /**
   * This will render the dropdown menu which contains the scaling options for timeline.
   * The contents of SCALE_LIST is a preset of options to scale with.
   */
  renderScaleList() {
    return (
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
    );
  }

  /**
   * This will render the lines and timestamps on timeline.
   * Shows an hour-stamp beside every line and in the top it shows which day.
   */
  renderTimestamps() {
    return (
      <div>
        {getLinePlacements(this.props.startTime, this.props.timeSpan).map(
          (p, i) => {
            let hour = (this.props.startTime.getHours() + i + 1) % 24;
            if (hour < 10) {
              var hourStr = "0" + hour;
            } else {
              var hourStr = "" + hour;
            }
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
                <div className={styles.hour}> {hourStr} </div>
              </div>
            );
          }
        )}

        {/*Creates days a box for each day and draws dates in them*/}
        {getDayPlacements(
          this.props.startTime,
          this.props.endTime,
          this.props.timeSpan
        ).map(([w, p, d], i) => {
          //Makes it so every other day is slightly darker
          let color = "rgba(185, 185, 185, 0.3)";
          if (i % 2) {
            color = "rgba(0, 0, 0, 0)";
          }
          return (
            <div
              className={styles.day}
              style={{
                backgroundColor: color,
                left: p,
                width: w,
              }}
              key={p}
            >
              <div className={styles.date}> {d} </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * Calculates the width of timeline.
   * Returns the result in percents.
   */
  getWidthOfTimeline() {
    return (this.props.timeSpan / (60 * 60 * 1000) / this.props.scale) * 100;
  }

  render() {
    return (
      <div className={styles.main}>
        {/* This will render the topbar which contains the dropdown menu(s) */}
        <div className={styles.topbar}>{this.renderScaleList()}</div>

        {/* This is the box containing all the timestamps, which is affected by scaling */}
        <div className={styles.sliderbox}>
          <div
            className={styles.slider}
            style={{
              width: this.getWidthOfTimeline() + "%",
            }}
          >
            {/* Glassbox component */}
            <Glassbox />

            {/* Creates a line for each timestamp and draws out hours*/}
            {this.renderTimestamps()}
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
