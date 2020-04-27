import React, { Component } from "react";
import { connect } from "react-redux";
import { setPosition, setPlayer, play, pause } from "../../state/statePlayer";

import "../../../node_modules/video-react/dist/video-react.css"; // import css
import {
  Player as ReactPlayer,
  ControlBar,
  ReplayControl,
  ForwardControl,
  CurrentTimeDisplay,
  TimeDivider,
  PlaybackRateMenuButton,
  VolumeMenuButton,
} from "video-react";

/* -- Player -- */
class Player extends Component {
  constructor(props) {
    super(props);
  }

  // Load the source of the player if it updates
  componentDidUpdate(prevProps, prevState) {
    if (this.props.clipID !== prevProps.clipID) {
      this.player.load();
    }
  }

  componentDidMount() {
    this.player.subscribeToStateChange(this.handleStateChange.bind(this));
    this.props.setPlayer(this.player);
  }

  handleStateChange(state) {
    // Update states in store based on state of player
    // Update the current position state
    this.props.setPosition(state.currentTime);

    // Update the playing state
    if (state.paused && this.props.playing) {
      play();
    } else if (!state.paused && !this.props.playing) {
      pause();
    }
  }

  render() {
    return (
      <React.Fragment>
        <ReactPlayer
          ref={(player) => {
            this.player = player;
          }}
        >
          <source
            src={
              "http://127.0.0.1:8000/video/stream/" + this.props.clipID + "/"
            }
          />
          <ControlBar>
            <ReplayControl seconds={10} order={1.1} />
            <ForwardControl seconds={30} order={1.2} />
            <CurrentTimeDisplay order={4.1} />
            <TimeDivider order={4.2} />
            <PlaybackRateMenuButton rates={[5, 2, 1, 0.5, 0.1]} order={7.1} />
            <VolumeMenuButton disabled />
          </ControlBar>
        </ReactPlayer>
      </React.Fragment>
    );
  }
}

// Map Redux states to React props
const mapStateToProps = (state) => {
  return {
    clipID: state.player.clipID,
    time: state.player.clipTime,
    playing: state.player.playing,
    player: state.player.player,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    setPosition: (time) => dispatch(setPosition(time)),
    setPlayer: (player) => dispatch(setPlayer(player)),
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Player);
