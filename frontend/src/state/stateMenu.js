import store from "./state";

/* -- ACTIONS -- */
export const TOGGLE_OBJECT_DETECTION = "TOGGLE_OBJECT_DETECTION";
export const TOGGLE_PROJECT_SWITCHER = "TOGGLE_PROJECT_SWITCHER";
export const TOGGLE_FOLDER_MANAGER = "TOGGLE_FOLDER_MANAGER";

/* -- INITIAL STATE -- */
export const initialState = {
  showObjectDetection: false,
  showProjectSwitcher: true,
  showFolderManager: false,
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

/**
 * Open/closes the folder manager pop up.
 */
export function toggleShowFolderManager() {
  return {
    type: TOGGLE_FOLDER_MANAGER,
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
    case TOGGLE_FOLDER_MANAGER:
      return {
        ...state,
        showFolderManager: !state.showFolderManager,
      };
    default:
      return state;
  }
};

export default menuReducer;
