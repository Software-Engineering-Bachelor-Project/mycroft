import store from "./state";
import { NEW_PROJECT } from "./stateCommunication";

/* -- ACTIONS -- */
export const TOGGLE_OBJECT_DETECTION = "TOGGLE_OBJECT_DETECTION";
export const TOGGLE_PROJECT_SWITCHER = "TOGGLE_PROJECT_SWITCHER";
export const TOGGLE_FOLDER_MANAGER = "TOGGLE_FOLDER_MANAGER";
export const SET_NEW_PROJECT = "SET_NEW_PROJECT";

/* -- INITIAL STATE -- */
export const initialState = {
  showObjectDetection: false,
  showProjectSwitcher: true,
  showFolderManager: false,
  newProject: false,
  fromFolderManager: false,
};

/* -- ACTION CREATORS -- */

/**
 * Open/closes object detection pop up.
 */
export function toggleShowObjectDetection(fromShowManager = false) {
  return {
    type: TOGGLE_OBJECT_DETECTION,
    payload: fromShowManager,
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

/**
 * Sets new project flag.
 */
export function setNewProject(newProject) {
  return {
    type: SET_NEW_PROJECT,
    payload: newProject,
  };
}

/* -- REDUX REDUCER -- */
const menuReducer = (state = initialState, action) => {
  switch (action.type) {
    case TOGGLE_OBJECT_DETECTION:
      return {
        ...state,
        showObjectDetection: !state.showObjectDetection,
        fromFolderManager: action.payload,
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
    case SET_NEW_PROJECT:
      return {
        ...state,
        newProject: action.payload,
      };
    default:
      return state;
  }
};

export default menuReducer;
