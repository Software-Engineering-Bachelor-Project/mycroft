import store from "./state";

/* -- ACTIONS -- */
const PLAY_CLIP = "PLAY_CLIP";

/* -- INITIAL STATE -- */
const initialState = {
  clips: [],
};

/* -- ACTION CREATORS -- */
export function playClip() {
  return {
    type: PLAY_CLIP,
  };
}

/* -- REDUX REDUCER -- */
const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case PLAY_CLIP:
      break;
    default:
      return state;
  }
};

export default playerReducer;
