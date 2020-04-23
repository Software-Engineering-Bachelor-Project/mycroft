import store from "./state";

/* -- CONSTANTS -- */
export const MAP_MODE = true;
export const PLAYER_MODE = false;

/* -- ACTIONS -- */
export const SWITCH_MODE = "SWITCH_MODE";

/* -- INITIAL STATE -- */
export const initialState = {
  mode: MAP_MODE,
};

/* -- ACTION CREATORS -- */

/**
 * Switch modes for viewport and miniviewport
 */
export function switchMode() {
  return {
    type: SWITCH_MODE,
  };
}

/* -- REDUX REDUCER -- */
const viewportReducer = (state = initialState, action) => {
  switch (action.type) {
    case SWITCH_MODE:
      return {
        ...state,
        mode: state.mode ? PLAYER_MODE : MAP_MODE,
      };
    default:
      return state;
  }
};

export default viewportReducer;
