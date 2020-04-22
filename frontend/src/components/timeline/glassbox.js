import React, { Component } from "react";
import { connect } from "react-redux";

//import functions
import { gbSetTimeLimits } from "./../../state/stateTimeline";

//import css
import styles from "./timeline.module.css";

/**
 * This class respresents the glassbox component.
 */
class Glassbox extends Component {
  constructor(props) {
    super(props);
    this.intervalChanged = this.intervalChanged.bind(this);
  }

  intervalChanged(start, end) {
    //TODO: dispatch modifyFilter action using start and end time
    this.props.gbSetTimeLimits(start, end);
  }

  render() {
    return (
      <div
        className={styles.glassbox}
        style={{
          width: (this.props.gbTimeSpan / this.props.timeSpan) * 100 + "%",
          left:
            ((this.props.gbStartTime.getTime() -
              this.props.startTime.getTime()) /
              this.props.timeSpan) *
              100 +
            "%",
        }}
      ></div>
    );
  }
}

//Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    startTime: state.timeline.startTime,
    endTime: state.timeline.endTime,
    timeSpan: state.timeline.timeSpan,

    //Glassbox
    gbStartTime: state.timeline.glassbox.startTime,
    gbEndTime: state.timeline.glassbox.endTime,
    gbTimeSpan: state.timeline.glassbox.timeSpan,
  };
};

//Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    gbSetTimeLimits: (startDate, endDate) =>
      dispatch(gbSetTimeLimits(startDate, endDate)),
  };
};

//Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Glassbox);
