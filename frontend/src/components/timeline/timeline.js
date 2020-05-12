import React, { Component } from "react";
import { connect } from "react-redux";

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Popover from "react-bootstrap/Popover";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Calendar from "react-calendar";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";

//import icons
import markerIcon from "../../images/timemarker.png";
import playIcon from "../../images/baseline_play_arrow_white_18dp.png";
import pauseIcon from "../../images/baseline_pause_white_18dp.png";
import skipPrevIcon from "../../images/baseline_skip_previous_white_18dp.png";
import skipNextIcon from "../../images/baseline_skip_next_white_18dp.png";

import { zoom, gbSetTimeLimits } from "../../state/stateTimeline";
import { jump, pause, play } from "../../state/statePlayer";
import {
  modifyFilter,
  getClipsMatchingFilter,
  getFilter,
} from "../../state/stateCommunication";

import styles from "./timeline.module.css";

import Glassbox from "./glassbox";
import Cliplines from "./cliplines";

import { START_TIME, END_TIME, doActionsInOrder } from "../../util";

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
const SCALE_LIST = [1, 5, 12, 24, 36, 48];
//Options for time filtering menus
const HOUR_LIST = [
  "00",
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
];
const MIN_LIST = [
  "00",
  "05",
  "10",
  "15",
  "20",
  "25",
  "30",
  "35",
  "40",
  "45",
  "50",
  "55",
];

/**
 * This class respresents the timeline react-component.
 */
class Timeline extends Component {
  constructor(props) {
    super(props);
    this.renderScaleList = this.renderScaleList.bind(this);
    this.renderTimestamps = this.renderTimestamps.bind(this);
    this.getWidthOfTimeline = this.getWidthOfTimeline.bind(this);
    this.renderContentOfTopbar = this.renderContentOfTopbar.bind(this);
    this.renderSliderContent = this.renderSliderContent.bind(this);
    this.renderTimemarker = this.renderTimemarker.bind(this);
    this.getTimemarkerPos = this.getTimemarkerPos.bind(this);
    this.setTimemarker = this.setTimemarker.bind(this);
    this.grabTimemarker = this.grabTimemarker.bind(this);
    this.moveTimemarker = this.moveTimemarker.bind(this);
    this.updateTimemarker = this.updateTimemarker.bind(this);
    this.updateTimemarker = this.updateTimemarker.bind(this);
    this.renderFilterPrompts = this.renderFilterPrompts.bind(this);
    this.getFullDate = this.getFullDate.bind(this);
    this.renderCalendar = this.renderCalendar.bind(this);
    this.renderFilterPrompts = this.renderFilterPrompts.bind(this);
    this.renderHourList = this.renderHourList.bind(this);
    this.renderMinList = this.renderMinList.bind(this);
    this.intervalChanged = this.intervalChanged.bind(this);
    this.handleGlassboxInput = this.handleGlassboxInput.bind(this);
    this.hourToDate = this.hourToDate.bind(this);
    this.minToDate = this.minToDate.bind(this);
    this.handlePlayPause = this.handlePlayPause.bind(this);
    this.jumpInClip = this.jumpInClip.bind(this);

    // state variables
    this.state = {
      mouseDownXPos: 0,
      mouseDownActive: false,
      mouseMoveXPos: 0,
    };
  }

  /**
   * This will render the dropdown menu which contains the scaling options for timeline.
   * The contents of SCALE_LIST is a preset of options to scale with.
   */
  renderScaleList() {
    return (
      <div className={styles.dropdown}>
        <DropdownButton alignRight title={this.props.scale + " Hours"}>
          {/* Create dropdown items for every scaling option */}
          {SCALE_LIST.map((hrs) => {
            return (
              <Dropdown.Item
                onClick={(a) => this.props.zoom(hrs, this.props.viewportMode)}
                key={hrs}
              >
                {hrs + " Hours"}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </div>
    );
  }

  /**
   * This will render the lines and timestamps on timeline.
   * Shows an hour-stamp beside every line and in the top it shows which day.
   */
  renderTimestamps(startTime, endTime, timeSpan) {
    return (
      <div>
        {getLinePlacements(startTime, timeSpan).map((p, i) => {
          let hour = (startTime.getHours() + i + 1) % 24;
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
        })}

        {/*Creates days a box for each day and draws dates in them*/}
        {getDayPlacements(startTime, endTime, timeSpan).map(([w, p, d], i) => {
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
   * Render different content in topbar depending on what mode viewport is in.
   */
  renderContentOfTopbar() {
    if (this.props.viewportMode) {
      // TODO:: draw the content of topbar when in Map-mode.
      return (
        <div>
          {this.renderFilterPrompts()}
          <div style={{ left: "5px", top: "0px", position: "absolute" }}>
            Topbar: Map-mode
          </div>
        </div>
      );
    }
    return (
      // This div contains Buttons for playing/pausing and jumping in a video
      <div
        style={{
          left: "calc(50% / width)",
          top: "5px",
          position: "absolute",
        }}
      >
        <Button
          key={"jumpBackwards"}
          onClick={(a) => this.jumpInClip(-1)}
          variant="success"
          style={{ marginRight: "10px" }}
          className={styles.playerButton}
        >
          <Image src={skipPrevIcon} className={styles.playerIcon} />
        </Button>
        <Button
          key={"playPause"}
          onClick={this.handlePlayPause}
          variant="success"
          className={styles.playerButton}
        >
          <Image
            src={this.props.playing ? pauseIcon : playIcon}
            className={styles.playerIcon}
          />
        </Button>
        <Button
          key={"jumpForward"}
          onClick={(a) => this.jumpInClip(1)}
          variant="success"
          style={{ marginLeft: "10px" }}
          className={styles.playerButton}
        >
          <Image src={skipNextIcon} className={styles.playerIcon} />
        </Button>
      </div>
    );
  }

  /**
   * Calls jump-function in statePlayer to jump number of frames.
   *
   * @param {int} frames number of frames to jump in clip
   */
  jumpInClip(frames) {
    if (this.props.clipID) {
      if (!(this.props.clipID in this.props.clips)) {
        console.warn(
          "In timeline.js, jumpInClip(frames): ",
          "Clip with id ",
          clipID,
          " does not exist in current project"
        );
        return;
      }
      this.props.jump(frames / this.props.clips[this.props.clipID].frameRate);
    }
  }

  /**
   * Handles playing and pausing a video.
   * Toggles "Play", "Pause" -text in playPause-Button.
   */
  handlePlayPause() {
    if (!this.props.playing) {
      this.props.play();
    } else {
      this.props.pause();
    }
  }

  /**
   * Render slider content, either Map or Player depending on viewport mode
   */
  renderSliderContent() {
    if (this.props.viewportMode) {
      // Map-mode
      return (
        <div
          className={styles.slider}
          style={{
            width: this.getWidthOfTimeline() + "%",
          }}
        >
          {/* Creates a line for each timestamp and draws out hours*/}
          {this.renderTimestamps(
            this.props.startTime,
            this.props.endTime,
            this.props.timeSpan
          )}

          {/* Glassbox component */}
          <Glassbox />
        </div>
      );
    }
    // Player-mode
    return (
      <div
        id="playerSliderDIV"
        className={styles.slider}
        style={{
          opacity: "0.7",
          width: this.getWidthOfTimeline() + "%",
        }}
        onMouseMove={this.moveTimemarker}
        onMouseUp={this.updateTimemarker}
        onMouseLeave={this.updateTimemarker}
      >
        {/* Creates a line for each timestamp and draws out hours*/}
        {this.renderTimestamps(
          this.props.glassbox.startTime,
          this.props.glassbox.endTime,
          this.props.glassbox.timeSpan
        )}

        {/* Clipline component */}
        <Cliplines />

        {/* Timemarker */}
        {this.renderTimemarker()}
      </div>
    );
  }

  /**
   * Render timemarker
   */
  renderTimemarker() {
    return (
      <div
        id="timemarkerDIV"
        className={styles.timemarker}
        style={{
          left: this.getTimemarkerPos() + "%",
        }}
      >
        {/* icon */}
        <div id="iconDIV">
          <img
            className={styles.markerIcon}
            src={markerIcon}
            alt="markerIcon"
            draggable="false"
            onMouseDown={this.grabTimemarker}
          />
        </div>

        {/* linemarker */}
        <div id="linemarkerDIV" className={styles.linemarker}></div>
      </div>
    );
  }

  /**
   * Renders lists of hours for filter input
   * @param {boolean} start Flag that tells the function if it's start or end time
   */
  renderHourList(start) {
    //Do this for start time
    if (start) {
      var hour = this.props.glassbox.startTime.getHours();
      hour = HOUR_LIST[hour];
      return (
        <div style={{}}>
          <DropdownButton alignRight title={hour}>
            {/* Create dropdown items for every start time filter hour */}
            {HOUR_LIST.map((h) => {
              return (
                <Dropdown.Item
                  onClick={(a) =>
                    this.intervalChanged(this.hourToDate(h, true), undefined)
                  }
                  key={h}
                >
                  {h}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </div>
      );
    }

    //Do this for end time
    var hour = this.props.glassbox.endTime.getHours();
    hour = HOUR_LIST[hour];
    return (
      <div>
        <DropdownButton alignRight title={hour}>
          {/* Create dropdown items for every end time filter hour */}
          {HOUR_LIST.map((h) => {
            return (
              <Dropdown.Item
                onClick={(a) =>
                  this.intervalChanged(undefined, this.hourToDate(h, false))
                }
                key={h}
              >
                {h}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </div>
    );
  }

  /**
   * Renders lists of hours for filter input
   * @param {boolean} start Flag that tells the function if it's start or end time
   */
  renderMinList(start) {
    //Do this for start time
    if (start) {
      var min = this.props.glassbox.startTime.getMinutes();
      if (min < 10) {
        var min = "0" + min;
      }
      return (
        <div>
          <DropdownButton alignRight title={min}>
            {/* Create dropdown items for every start time filter minute */}
            {MIN_LIST.map((minute) => {
              return (
                <Dropdown.Item
                  onClick={(a) =>
                    this.intervalChanged(
                      this.minToDate(minute, true),
                      undefined
                    )
                  }
                  key={minute}
                >
                  {minute}
                </Dropdown.Item>
              );
            })}
          </DropdownButton>
        </div>
      );
    }

    //Do this for end time
    var min = this.props.glassbox.endTime.getMinutes();
    if (min < 10) {
      var min = "0" + min;
    }
    return (
      <div>
        <DropdownButton alignRight title={min}>
          {/* Create dropdown items for every end time filter minute */}
          {MIN_LIST.map((minute) => {
            return (
              <Dropdown.Item
                onClick={(a) =>
                  this.intervalChanged(undefined, this.minToDate(minute, false))
                }
                key={minute}
              >
                {minute}
              </Dropdown.Item>
            );
          })}
        </DropdownButton>
      </div>
    );
  }

  /**
   * Render calendar for filter input
   * @param {String} title Flag that decides whether to render calendar for
   * start or end time
   */
  renderCalendar(title) {
    //Do this for start time
    if (title == "start") {
      return (
        <Popover id="popover-basic">
          <Popover.Title as="h3"> Start Time </Popover.Title>
          <Popover.Content>
            <Calendar
              minDate={this.props.startTime}
              maxDate={this.props.glassbox.endTime}
              onChange={(date) =>
                this.intervalChanged(this.getFullDate(date, true), undefined)
              }
            />
          </Popover.Content>
        </Popover>
      );
    }

    //Do this for end time
    return (
      <Popover id="popover-basic">
        <Popover.Title as="h3"> End Time </Popover.Title>
        <Popover.Content>
          <Calendar
            minDate={this.props.glassbox.startTime}
            maxDate={this.props.endTime}
            onChange={(date) =>
              this.intervalChanged(undefined, this.getFullDate(date, false))
            }
          />
        </Popover.Content>
      </Popover>
    );
  }

  /**
   * Render all the buttons that deal with filter input
   */
  renderFilterPrompts() {
    return (
      <div style={{ position: "relative", display: "flex" }}>
        {/*Start time filter button*/}
        <div className={styles.filter} style={{ marginRight: "5px" }}>
          <div style={{ position: "relative", top: "9px", fontSize: "14pt" }}>
            {" "}
            Filter Start:{" "}
          </div>
          <div style={{ margin: "5px" }}>
            <OverlayTrigger
              trigger="click"
              placement="top"
              rootClose
              overlay={this.renderCalendar("start")}
            >
              <Button variant="success">
                {" "}
                {this.props.glassbox.startTime.toDateString()}{" "}
              </Button>
            </OverlayTrigger>
          </div>
          <div style={{ margin: "5px" }}> {this.renderHourList(true)} </div>
          <div style={{ position: "relative", top: "12px" }}>:</div>
          <div style={{ margin: "5px" }}> {this.renderMinList(true)} </div>
        </div>

        {/*End time filter button*/}
        <div className={styles.filter} style={{ marginLeft: "5px" }}>
          <div style={{ position: "relative", top: "9px", fontSize: "14pt" }}>
            Filter End:
          </div>
          <div style={{ margin: "5px" }}>
            <OverlayTrigger
              trigger="click"
              placement="top"
              rootClose
              overlay={this.renderCalendar("end")}
            >
              <Button variant="success">
                {" "}
                {this.props.glassbox.endTime.toDateString()}{" "}
              </Button>
            </OverlayTrigger>
          </div>
          <div style={{ margin: "5px" }}> {this.renderHourList(false)} </div>
          <div style={{ position: "relative", top: "12px" }}>:</div>
          <div style={{ margin: "5px" }}> {this.renderMinList(false)} </div>
        </div>
      </div>
    );
  }

  /**
   * Makes sure start and end time of glassbox is defined. If not it returns the
   * already existing start and end time
   * @param {Date} start Start time
   * @param {Date} end End time
   */
  handleGlassboxInput(start, end) {
    if (start == undefined && end == undefined) {
      return [this.props.glassbox.startTime, this.props.glassbox.endTime];
    } else if (start == undefined && end) {
      return [this.props.glassbox.startTime, end];
    } else if (start && end == undefined) {
      return [start, this.props.glassbox.endTime];
    } else {
      return [start, end];
    }
  }

  /**
   * Timemarker:
   * Handle timemarker moving (mouse move).
   * Update local state variables.
   *
   * @param {event} e mouse event
   */
  moveTimemarker(e) {
    if (this.state.mouseDownActive) {
      this.setState({ mouseMoveXPos: e.clientX });
    }
  }

  /**
   * Timemarker:
   * Handle timemarker release (mouse up).
   * Update local state variables.
   *
   * @param {event} e mouse event
   */
  updateTimemarker(e) {
    if (this.state.mouseDownActive) {
      this.setTimemarker(e);
      this.setState({
        mouseDownActive: false,
        mouseMoveXPos: 0,
      });
    }
  }

  /**
   * Timemarker:
   * Handle timemarker click (mouse down).
   * Update local state variables.
   *
   * @param {event} e mouse event
   */
  grabTimemarker(e) {
    this.setState({
      mouseDownXPos: e.clientX,
      mouseMoveXPos: e.clientX,
      mouseDownActive: true,
    });
  }

  /**
   * Moves the timemarker when updateTimemarker is called.
   * Calls the jump function in statePlayer.js to change position in clip.
   *
   * @param {event} e mouse event
   */
  setTimemarker(e) {
    var mouseUpXPos = e.clientX;
    var totalWidth = playerSliderDIV.clientWidth;

    var deltaPos = mouseUpXPos - this.state.mouseDownXPos;
    var deltaPercent = deltaPos / totalWidth;

    var timeDeltaSeconds = deltaPercent * (this.props.glassbox.timeSpan / 1000);
    this.props.jump(timeDeltaSeconds);
  }

  /**
   * Calculates the position for timemarker.
   * Returns the result in percents.
   *
   * Handles moving timemarker. Updates position for timemarker continuously.
   *
   * @param {int} returns a position left (in percents) for timemarker
   */
  getTimemarkerPos() {
    if (!this.props.clipID) return 0;
    if (!(this.props.clipID in this.props.clips)) return 0;

    var clip = this.props.clips[this.props.clipID];
    var timeOfClip = clip.startTime.getTime() + this.props.position * 1000;

    if (timeOfClip < this.props.glassbox.startTime.getTime()) return 0;

    // User is moving the timemarker
    if (this.state.mouseDownActive && this.state.mouseMoveXPos > 0) {
      var deltaPos = this.state.mouseMoveXPos - this.state.mouseDownXPos;
      var deltaPercent = deltaPos / playerSliderDIV.clientWidth;
      var timeDelta = deltaPercent * this.props.glassbox.timeSpan;

      return (
        ((timeDelta + timeOfClip - this.props.glassbox.startTime.getTime()) /
          this.props.glassbox.timeSpan) *
        100
      );
    } else {
      return (
        ((timeOfClip - this.props.glassbox.startTime.getTime()) /
          this.props.glassbox.timeSpan) *
        100
      );
    }
  }

  /**
   * Changes the start and end time of glassbox. Also checks so that start and end
   * time is within their allowed intervals
   * @param {Date} start Start time
   * @param {Date} end End time
   */
  intervalChanged(start, end) {
    //TODO: dispatch modifyFilter action using start and end time
    let startTime, endTime;
    [startTime, endTime] = this.handleGlassboxInput(start, end);
    if (
      startTime.getTime() > endTime.getTime() ||
      startTime.getTime() < this.props.startTime.getTime() ||
      endTime.getTime() > this.props.endTime.getTime()
    )
      return;
    this.props.gbSetTimeLimits(startTime, endTime);

    // Send filter updates to server
    doActionsInOrder([
      () => this.props.modifyTimeFilter(startTime, endTime),
      () => this.props.updateFilter(),
    ]);
  }

  /**
   * Takes a date object, adds the hours, minutes and seconds of either
   * start or end time of glassbox and returns it
   * @param {Date} date Date without any hours, minutes or seconds
   * @param {boolean} start True if the date should be based on glassbox's
   * start time, false if end time
   */
  getFullDate(date, start) {
    if (start) {
      let newDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        this.props.glassbox.startTime.getHours(),
        this.props.glassbox.startTime.getMinutes(),
        this.props.glassbox.startTime.getSeconds()
      );
      return newDate;
    }
    let newDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      this.props.glassbox.endTime.getHours(),
      this.props.glassbox.endTime.getMinutes(),
      this.props.glassbox.endTime.getSeconds()
    );
    return newDate;
  }

  /**
   * Create and return a new date object that has the same date properties as
   * either glassbox's start or end time but with the hour set to something new
   * @param {String} hour Hour to set new date to
   * @param {boolean} start True if the date should be based on glassbox's
   * start time, false if end time
   */
  hourToDate(hour, start) {
    if (start) {
      let newDate = new Date(
        this.props.glassbox.startTime.getFullYear(),
        this.props.glassbox.startTime.getMonth(),
        this.props.glassbox.startTime.getDate(),
        parseInt(hour),
        this.props.glassbox.startTime.getMinutes(),
        this.props.glassbox.startTime.getSeconds()
      );
      return newDate;
    }
    let newDate = new Date(
      this.props.glassbox.endTime.getFullYear(),
      this.props.glassbox.endTime.getMonth(),
      this.props.glassbox.endTime.getDate(),
      parseInt(hour),
      this.props.glassbox.endTime.getMinutes(),
      this.props.glassbox.endTime.getSeconds()
    );
    return newDate;
  }

  /**
   * Create and return a new date object that has the same date properties as
   * either glassbox's start or end time but with the minute set to something new
   * @param {String} minute Minute to set new date to
   * @param {boolean} start True if the date should be based on glassbox's
   * start time, false if end time
   */
  minToDate(minute, start) {
    if (start) {
      let newDate = new Date(
        this.props.glassbox.startTime.getFullYear(),
        this.props.glassbox.startTime.getMonth(),
        this.props.glassbox.startTime.getDate(),
        this.props.glassbox.startTime.getHours(),
        parseInt(minute),
        this.props.glassbox.startTime.getSeconds()
      );
      return newDate;
    }
    let newDate = new Date(
      this.props.glassbox.endTime.getFullYear(),
      this.props.glassbox.endTime.getMonth(),
      this.props.glassbox.endTime.getDate(),
      this.props.glassbox.endTime.getHours(),
      parseInt(minute),
      this.props.glassbox.endTime.getSeconds()
    );
    return newDate;
  }

  /**
   * Calculates the width of timeline.
   * Returns the result in percents.
   */
  getWidthOfTimeline() {
    if (this.props.viewportMode) {
      return (this.props.timeSpan / (60 * 60 * 1000) / this.props.scale) * 100;
    }
    return (
      (this.props.glassbox.timeSpan / (60 * 60 * 1000) / this.props.scale) * 100
    );
  }

  /**
   * Main render function
   */
  render() {
    return (
      <div className={styles.main}>
        {/* This will render the topbar which contains the dropdown menu(s) */}
        <div className={styles.topbar}>
          {this.renderContentOfTopbar()}
          {this.renderScaleList()}
        </div>

        {/* This is the box containing all the timestamps, which is affected by scaling */}
        <div className={styles.sliderbox}>
          {/* This renders the content of slider */}
          {this.renderSliderContent()}
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
    timeSpan: state.timeline.timeSpan,
    scale: state.timeline.scale,

    glassbox: state.timeline.glassbox,

    viewportMode: state.viewport.mode,

    clips: state.com.clips,

    //Player
    clipID: state.player.clipID,
    position: state.player.position,
    playing: state.player.playing,
  };
};

//Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    zoom: (hrs, viewportMode) => dispatch(zoom(hrs, viewportMode)),
    jump: (timeDelta) => dispatch(jump(timeDelta)),
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),

    gbSetTimeLimits: (startDate, endDate) =>
      dispatch(gbSetTimeLimits(startDate, endDate)),
    modifyTimeFilter: (s, e) =>
      dispatch(modifyFilter({ [START_TIME]: s, [END_TIME]: e })),
    updateFilter: () => {
      dispatch(getFilter());
      dispatch(getClipsMatchingFilter());
    },
  };
};

//Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Timeline);
