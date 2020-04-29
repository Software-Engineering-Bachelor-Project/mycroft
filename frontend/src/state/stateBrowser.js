import store from "./state";

import { Camera, Clip, Folder } from "../types";
import { getClipInfo } from "./stateCommunication";

/* -- CONSTANT -- */
export const INSPECTOR_MODE_CAMERA = 0;
export const INSPECTOR_MODE_CLIP = 1;
export const INSPECTOR_MODE_EXLUDED_INCLUDED = 2;
export const INSPECTOR_MODE_AREA = 3;

/* -- ACTIONS -- */
export const CHANGE_MODE = "CHANGE_MODE";

export const CHANGE_BROWSER_TAB = "CHANGE_BROWSER_TAB";

/* -- INITIAL STATE -- */

export const initialState = {
  currentTab: undefined,
  inspector: {
    mode: INSPECTOR_MODE_CAMERA,
    id: 0,
  },
};

/* -- ACTION CREATORS -- */

export function changeMode(mode, id) {
  return {
    type: CHANGE_MODE,
    mode: mode,
    id: id,
  };
}

/**
 * This action is used to change what tab is currently being displayed.
 *
 * @param {string} key Should be "clipBrowser", "fileBrowser", or "inspectorBrowser"
 */
export function changeBrowserTab(key) {
  if (
    key != "clipBrowser" &&
    key != "fileBrowser" &&
    key != "inspectorBrowser"
  ) {
    console.error("Cannot change to non-existent tab: '" + key + "'");
    key = undefined;
  }
  return {
    type: CHANGE_BROWSER_TAB,
    key: key,
  };
}

/* -- REDUX REDUCER -- */
export const browserReducer = (state = initialState, action) => {
  switch (action.type) {
    case CHANGE_MODE:
      return {
        ...state,
        inspector: {
          ...state.inspector,
          mode: action.mode,
          id: action.id,
        },
      };
    case CHANGE_BROWSER_TAB:
      if (action.key == undefined) return state;
      return {
        ...state,
        currentTab: action.key,
      };
      break;
    default:
      return state;
  }
};

export default browserReducer;
