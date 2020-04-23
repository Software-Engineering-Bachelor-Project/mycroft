import store from "./state";
import { ADD_CAMERA } from "./stateMap";

/* -- ACTIONS -- */
export const PLAY_CLIP = "PLAY_CLIP";

/* -- INITIAL STATE -- */
export const initialState = {
  clipID: null,
};

/* -- ACTION CREATORS -- */
/**
 *
 * Creates an action used for playing a clip
 *
 * @param {int} clipID id of clip to play.
 * @return {action} Action for adding a camera.
 */
export function playClip(clipID) {
  return {
    type: PLAY_CLIP,
    clipID: clipID,
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
    default:
      return state;
  }
};

export default playerReducer;
