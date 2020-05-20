import React, { Component } from "react";
import { connect } from "react-redux";
import {
  setPosition,
  setPlayer,
  play,
  pause,
  playClip,
} from "../../state/statePlayer";
import { getSequentialClip } from "../../state/stateCommunication";
import { doActionsInOrder } from "../../util";

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
    this.playNext = this.playNext.bind(this);
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

  playNext() {
    doActionsInOrder([
      () => {
        if (this.props.clipID != undefined)
          this.props.getNextClip(this.props.clipID);
      },
      () => {
        if (
          this.props.nextClip != undefined &&
          this.props.clips.hasOwnProperty(this.props.nextClip) &&
          this.props.clips[this.props.nextClip].playable
        ) {
          this.props.playClip(this.props.nextClip);
          setTimeout(() => this.props.play(), 100);
        }
      },
    ]);
  }

  render() {
    return (
      <React.Fragment>
        <ReactPlayer
          ref={(player) => {
            this.player = player;
          }}
          fluid={false}
          width="100%"
          height="100%"
          onPlay={this.props.play}
          onPause={this.props.pause}
          onEnded={this.playNext}
        >
          <source src={"/video/stream/" + this.props.clipID + "/"} />
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
    playing: state.player.playing,
    player: state.player.player,
    nextClip: state.com.player.nextClip,
    clips: state.com.clips,
  };
};

// Forward Redux's dispatch function to React props
const mapDispatchToProps = (dispatch) => {
  return {
    setPosition: (time) => dispatch(setPosition(time)),
    setPlayer: (player) => dispatch(setPlayer(player)),
    play: () => dispatch(play()),
    pause: () => dispatch(pause()),
    getNextClip: (cid) => dispatch(getSequentialClip(cid)),
    playClip: (id) => dispatch(playClip(id)),
  };
};

// Connect Redux with React
export default connect(mapStateToProps, mapDispatchToProps)(Player);
