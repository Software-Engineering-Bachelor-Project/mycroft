import store from "./state";

/* -- ACTIONS -- */
export const TOGGLE_OBJECT_DETECTION = "TOGGLE_OBJECT_DETECTION";
export const TOGGLE_PROJECT_SWITCHER = "TOGGLE_PROJECT_SWITCHER";

/* -- INITIAL STATE -- */
export const initialState = {
  showObjectDetection: false,
  showProjectSwitcher: true,
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

/**
 * Open/closes the project switcher pop up.
 */
export function toggleShowProjectSwitcher() {
  return {
    type: TOGGLE_PROJECT_SWITCHER,
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
    case TOGGLE_PROJECT_SWITCHER:
      return {
        ...state,
        showProjectSwitcher: !state.showProjectSwitcher,
      };
    default:
      return state;
  }
};

export default menuReducer;
