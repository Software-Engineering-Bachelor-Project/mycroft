import store from "./state";

/* -- ACTIONS -- */
export const PLAY_CLIP = "PLAY_CLIP";
export const PLAY = "PLAY";
export const PAUSE = "PAUSE";
export const SET_POSITION = "SET_POSITION";
export const SET_PLAYER = "SET_PLAYER";
export const JUMP = "JUMP";

/* -- INITIAL STATE -- */
export const initialState = {
  clipID: null,
  position: 0,
  playing: false,
  player: null,
};

/* -- ACTION CREATORS -- */
/**
 *
 * Creates an action used for setting which clip should be played
 *
 * @param {int} clipID id of clip to play.
 * @return {action} Action for setting a clip tobe played in the player.
 */
export function playClip(clipID) {
  return {
    type: PLAY_CLIP,
    clipID: clipID,
  };
}

/**
 *
 * Creates an action used for pausing the clip playing in the player
 * NOTE: This should not be used for jumping in a clip, This should only be changed in the player component and is
 * read-only at other places
 *
 * @param {float} position, the position in the clip currently playing
 * @return {action} Action for setting the position
 */
export function setPosition(position) {
  return {
    type: SET_POSITION,
    position: position,
  };
}
/**
 *
 * Creates an action used for pausing the clip currently playing
 *
 * @return {action} Action for pausing a clip.
 */
export function pause() {
  return {
    type: PAUSE,
  };
}

/**
 *
 * Creates an action used for playing the clip currently selected
 *
 * @return {action} Action for playing a clip.
 */
export function play() {
  return {
    type: PLAY,
  };
}

/**
 *
 * Creates an action used for setting the player that plays the clip
 * NOTE!: Should only be used by the player component
 *
 * @param {Player} player the player
 * @return {action} Action for setting the player
 */
export function setPlayer(player) {
  return {
    type: SET_PLAYER,
    player: player,
  };
}

/**
 *
 * Jump a specified amount of seconds backward or forward in the clip
 *
 * @param {float} timeDelta the amount of seconds the position in the clip should be changed
 * @return {action} Action for setting the player
 */
export function jump(timeDelta) {
  return {
    type: JUMP,
    timeDelta: timeDelta,
  };
}

/* -- REDUX REDUCER -- */
const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY_CLIP:
      return {
        ...state,
        clipID: action.clipID,
      };

    case SET_POSITION:
      return {
        ...state,
        position: action.position,
      };
    case PLAY:
      if (state.player != null) {
        state.player.play();
        return {
          ...state,
          playing: true,
        };
      }
      return state;
    case PAUSE:
      if (state.player != null) {
        state.player.pause();
        return {
          ...state,
          playing: false,
        };
      }
      return state;
    case SET_PLAYER:
      return {
        ...state,
        player: action.player,
      };
    case JUMP:
      const { player } = state.player.getState();
      state.player.seek(player.currentTime + action.timeDelta);
      return { ...state };

    default:
      return state;
  }
};

export default playerReducer;
