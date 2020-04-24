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

// Temporary functions for generating IDs.
var ID_COUNTER_F = 1;
function genIDF() {
  return ID_COUNTER_F++;
}

var ID_COUNTER_C = 1;
function genIDC() {
  return ID_COUNTER_C++;
}

// Temporary function for generating folder structure.
function genFolderTree(depth, fs = 3, cs = 3, parent = undefined) {
  var id = genIDF();
  var f = new Folder(id, "Folder " + id, parent);

  var numSubs = Math.ceil(Math.random() * fs);
  var numClips = Math.ceil(Math.random() * cs);

  if (depth > 0) {
    for (var i = 0; i < numSubs; i++) {
      var tf = genFolderTree(depth - 1, fs, cs, f);
      f.folders = {
        ...f.folders,
        [tf.id]: tf,
      };
    }
  }

  for (var j = 0; j < numClips; j++) {
    var cid = genIDC();
    var c = new Clip(cid, "clip" + cid, f, "wav", "69", "420");
    f.clips = {
      ...f.clips,
      [c.id]: c,
    };
  }

  return f;
}

// Temporary root folders
var FOLDER_1 = genFolderTree(2);
var FOLDER_2 = genFolderTree(3);
var FOLDER_3 = genFolderTree(4);

export const initialState = {
  currentTab: undefined,
  folders: {
    [FOLDER_1.id]: FOLDER_1,
    [FOLDER_2.id]: FOLDER_2,
    [FOLDER_3.id]: FOLDER_3,
  },
  cameras: {
    1: new Camera(
      1,
      "cam1",
      [2, 2],
      {
        1: new Clip(1, "clip1", "testfolder", "testformat", "start", "end"),
        2: new Clip(2, "clio1.2", "testfolder", "testformat", "start", "end"),
      },
      false
    ),
    2: new Camera(
      2,
      "cam",
      [2, 4],
      { 1: new Clip(1, "clip2", "testfolder", "testformat", "start", "end") },
      false
    ),
    3: new Camera(
      3,
      "cam3",
      [6, 9],
      { 1: new Clip(1, "clip3", "testfolder", "testformat", "start", "end") },
      false
    ),
    4: new Camera(
      4,
      "cam3",
      [6, 9],
      { 1: new Clip(1, "clip3", "testfolder", "testformat", "start", "end") },
      false
    ),
    5: new Camera(
      5,
      "cam3",
      [6, 9],
      { 1: new Clip(1, "clip3", "testfolder", "testformat", "start", "end") },
      false
    ),
  },
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
