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
export const UPDATE_LIST = "UPDATE_LIST";

/* -- INITIAL STATE -- */

export const initialState = {
  currentTab: undefined,
  inspector: {
    mode: INSPECTOR_MODE_CAMERA,
    id: -1,
  },
  excList: [],
  incList: [],
};

/* -- ACTION CREATORS -- */

/**
 * This action is used to change the current mode in inspector.
 *
 * @param {string} mode Should be one of the constants:
 * INSPECTOR_MODE_CAMERA,
 * INSPECTOR_MODE_CLIP,
 * INSPECTOR_MODE_EXLUDED_INCLUDED,
 * INSPECTOR_MODE_AREA
 * @param {Number} id The unique identifier of the object relative to the mode. Should be an integer.
 */
export function changeMode(mode, id) {
  return {
    type: CHANGE_MODE,
    mode: mode,
    id: id,
  };
}

/**
 * This action is used to change the current mode in inspector.
 *
 * @param {Bool} include Should contain true/false to signal to include or exclude clip.
 * @param {Number} clipId Should contain the unique id for selected clip.
 */
export function updateList(include, clipId) {
  if (clipId === undefined) {
    console.error("clipdId invalid");
    clipId = -1;
  }
  return {
    type: UPDATE_LIST,
    include: include,
    clipId: clipId,
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
    case UPDATE_LIST:
      if (action.clipId == -1) {
        return state;
      } else {
        let tempList = action.include ? state.incList : state.excList;
        let otherList = action.include ? state.excList : state.incList;
        if (tempList.includes(action.clipId)) {
          /* Removes ClipId from tempList */

          tempList.splice(tempList.indexOf(action.clipId), 1);
          return {
            ...state,
            [action.include ? "incList" : "excList"]: [...tempList],
          };
        } else {
          if (otherList.includes(action.clipId)) {
            otherList.splice(otherList.indexOf(action.clipId), 1);
          }

          /* Adds clipId into the tempList and remove from otherList */
          tempList.push(action.clipId);

          return {
            ...state,
            [action.include ? "incList" : "excList"]: [...tempList],
            [action.include ? "excList" : "incList"]: [...otherList],
          };
        }
      }
    default:
      return state;
  }
};

export default browserReducer;
