import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";

// CSS
import styles from "./viewport.module.css";

// import components
import Player from "../player/player";
import Map from "../map/map";

//import functions
import { switchMode } from "../../state/stateViewport";
import { pause } from "../../state/statePlayer";

//import icons
import switchIcon from "../../images/baseline_import_export_white_18dp.png";

/* -- Viewport -- */
class Viewport extends Component {
  render() {
    return (
      <div className={styles.viewport}>
        {/* viewportMode decides which component Viewport should render */}
        {this.props.viewportMode ? <Map /> : <Player />}

        {/* Button for switching viewport mode */}
        <Button
          onClick={() => {
            this.props.switchMode();

            // The video is paused by the player so the play button must be updated.
            this.props.pauseVideo();
          }}
          className={styles.switchButton}
          variant="primary"
        >
          <Image src={switchIcon} className={styles.switchIcon} />
        </Button>
      </div>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    viewportMode: state.viewport.mode,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    switchMode: () => dispatch(switchMode()),
    pauseVideo: () => dispatch(pause()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Viewport);
