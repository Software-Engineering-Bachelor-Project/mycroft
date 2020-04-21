import store from "./state";

/* -- ACTIONS -- */
export const TOGGLE_OBJECT_DETECTION = "TOGGLE_OBJECT_DETECTION";

/* -- INITIAL STATE -- */
export const initialState = {
  showObjectDetection: false,
};

/* -- ACTION CREATORS -- */

/**
 * Open/closes object detection pop up.
 */
export function toggleShowObjectDetection() {
  return {
    type: TOGGLE_OBJECT_DETECTION,
  };
}

/* -- REDUX REDUCER -- */
const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_OBJECT_DETECTION:
      return {
        ...state,
        showObjectDetection: !state.showObjectDetection,
      };
    default:
      return state;
  }
};

export default menuReducer;
