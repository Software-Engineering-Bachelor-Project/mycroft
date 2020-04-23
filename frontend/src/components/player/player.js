import React, { Component } from "react";
import { connect } from "react-redux";
import styles from "../viewport/viewport.module.css";

/* -- Player -- */
class Player extends Component {
  renderVideo(props) {
    /**
     * Render video if a clip id has been set
     */

    const clipID = props.clipID;

    if (clipID) {
      return (
        <video key={clipID} width="100%" height="100%" controls autoPlay>
          <source
            key={clipID}
            src={"http://127.0.0.1:8000/video/stream/" + clipID + "/"}
            type="video/mp4"
          />
        </video>
      );
    }
    return <h2>No video selected</h2>;
  }

  render() {
    return (
      <React.Fragment>
        <this.renderVideo clipID={this.props.clipID} />
      </React.Fragment>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    clipID: state.player.clipID,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {};
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Player);
