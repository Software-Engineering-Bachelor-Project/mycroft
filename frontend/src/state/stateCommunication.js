import store from "./state";
import { makePOST, createFolderHierarchy } from "../util";

// Types
import { Project, Folder } from "../types";

/*
 * This file defines the state, reducers, and actions
 * used for communication between client and server.
 */

/* -- ACTIONS -- */

// Filter Module requests
export const GET_CLIPS_MATCHING_FILTER = "GET_CLIPS_MATCHING_FILTER";
export const MODIFY_FILTER = "MODIFY_FILTER";
export const GET_AREAS_IN_FILTER = "GET_AREAS_IN_FILTER";
export const CREATE_AREA = "CREATE_AREA";
export const GET_FILTER_PARAMS = "GET_FILTER_PARAMS";

export const URL_GET_CLIPS_MATCHING_FILTER = "/filter/get_matching_clips";
export const URL_MODIFY_FILTER = "/filter/modify";
export const URL_GET_AREAS_IN_FILTER = "/filter/get_areas";
export const URL_CREATE_AREA = "/filter/create_area";
export const URL_GET_FILTER_PARAMS = "/filter/getFilterParams";

// Project Manager requests
export const GET_PROJECTS = "GET_PROJECTS";
export const NEW_PROJECT = "NEW_PROJECT";
export const DELETE_PROJECT = "DELETE_PROJECT";
export const RENAME_PROJECT = "RENAME_PROJECT";

export const URL_GET_PROJECTS = "/project/get_all";
export const URL_NEW_PROJECT = "/project/new";
export const URL_DELETE_PROJECT = "/project/delete";
export const URL_RENAME_PROJECT = "/project/rename";

// Exporter requests
export const EXPORT_FILTER = "EXPORT_FILTER";
export const EXPORT_CLIPS = "EXPORT_CLIPS";

export const URL_EXPORT_FILTER = "/export/filter";
export const URL_EXPORT_CLIPS = "/export/clips";

// Video Manager requests
export const GET_CLIP_INFO = "GET_CLIP_INFO";
export const GET_CAMERAS = "GET_CAMERAS";
export const GET_SEQUENTIAL_CLIP = "GET_SEQUENTIAL_CLIP";

export const URL_GET_CLIP_INFO = "/video/get_info";
export const URL_GET_CAMERAS = "/video/get_cameras";
export const URL_GET_SEQUENTIAL_CLIP = "/video/get_sequential";

// File Manager requests
export const GET_FOLDERS = "GET_FOLDERS";
export const GET_SOURCE_FOLDERS = "GET_SOURCE_FOLDERS";
export const ADD_FOLDER = "ADD_FOLDER";
export const REMOVE_FOLDER = "REMOVE_FOLDER";

export const URL_GET_FOLDERS = "/file/get_folders";
export const URL_GET_SOURCE_FOLDERS = "/file/get_source_folders";
export const URL_ADD_FOLDER = "/file/add_folder";
export const URL_REMOVE_FOLDER = "/file/remove_folder";

// Object Detector requests
export const DETECT_OBJECTS = "DETECT_OBJECTS";
export const GET_OD_PROGRESS = "GET_OD_PROGRESS";
export const DELETE_OD_PROGRESS = "DELETE_OD_PROGRESS";

export const URL_DETECT_OBJECTS = "/object_detection/detect_objects";
export const URL_GET_OD_PROGRESS = "/object_detection/get_progress";
export const URL_DELETE_OD_PROGRESS = "/object_detection/delete_progress";

// Response
export const REQUEST_RESPONSE = "REQUEST_RESPONSE";

/* -- INITIAL STATE -- */
export const initialState = {
  projectID: -1,
  projects: {},
  folders: {},
  sourceFolders: {},
  od: {
    progressID: -1,
    currentProgress: 0,
  },
};

/* -- ACTION CREATORS -- */

// Filter Module requests
/**
 * TODO: Add doc-comment
 */
export function getClipsMatchingFilter() {
  return {
    type: GET_CLIPS_MATCHING_FILTER,
  };
}

/**
 * TODO: Add doc-comment
 */
export function modifyFilter() {
  return {
    type: MODIFY_FILTER,
  };
}

// Project Manager requests
/**
 * This action is used to request a list
 * of available projects from the server.
 */
export function getProjects() {
  return {
    type: GET_PROJECTS,
  };
}

/**
 * This action is used to request a new
 * project to be created on the server.
 *
 * @param {string} name The name of the new project.
 */
export function newProject(name) {
  return {
    type: NEW_PROJECT,
    name: name,
  };
}

/**
 * This actions is used to request deletion
 * of a project on the server.
 *
 * @param {int} id The unique identifier of the project to delete.
 */
export function deleteProject(id) {
  return {
    type: DELETE_PROJECT,
    id: id,
  };
}

/**
 * This action is used to request name
 * change of a project on the server.
 *
 * @param {int} id The unique identifier of the project whose name should be changed.
 * @param {string} name The new name of the project.
 */
export function renameProject(id, name) {
  return {
    type: RENAME_PROJECT,
    id: id,
    name: name,
  };
}

// Exporter requests
/**
 * TODO: Add doc-comment
 */
export function exportFilter() {
  return {
    type: EXPORT_FILTER,
  };
}

/**
 * TODO: Add doc-comment
 */
export function exportClips() {
  return {
    type: EXPORT_CLIPS,
  };
}

// Video Manager requests
/**
 * TODO: Add doc-comment
 */
export function getClipInfo() {
  return {
    type: GET_CLIP_INFO,
  };
}

/**
 * TODO: Add doc-comment
 */
export function getCameras() {
  return {
    type: GET_CAMERAS,
  };
}

// File Manager requests
/**
 * This action is used to get all folders in the current project.
 */
export function getFolders() {
  return {
    type: GET_FOLDERS,
  };
}

/**
 * This action is used to get all source folder.
 */
export function getSourceFolders() {
  return {
    type: GET_SOURCE_FOLDERS,
  };
}

/**
 * This action is used to add a source folder to the current project.
 * @param {Number} fid The ID of the folder to be added.
 */
export function addFolder(fid) {
  return {
    type: ADD_FOLDER,
    fid: fid,
  };
}

/**
 * This action is used to remove a source folder to the current project.
 * @param {Number} fid The ID of the folder to be added.
 */
export function removeFolder(fid) {
  return {
    type: REMOVE_FOLDER,
    fid: fid,
  };
}

// Object Detector requests
/**
 * This action is used to perform object detection.
 * @param {Number} rate rate for object detection.
 * @param {string} target from TARGET (FILTER or PROJECT).
 */
export function detectObjects(rate, target) {
  return {
    type: DETECT_OBJECTS,
    rate: rate,
    target: target,
  };
}

/**
 * This action is used to get the progress of an object detection.
 */
export function getODProgress() {
  return {
    type: GET_OD_PROGRESS,
  };
}

/**
 * This action is used to get the progress of an object detection.
 */
export function deleteODProgress() {
  return {
    type: DELETE_OD_PROGRESS,
  };
}

/**
 *
 * This action should be evoked whenever a request
 * response has been received.
 *
 * @param {string} reqType The type of request that was completed. Should be one of the action constants ('GET_PROJECTS' etc.).
 * @param {int} status The HTTP status code of the response.
 * @param {JSON} data The JSON data returned from the server. May be undefined, if the request somehow failed.
 */
export function requestResponse(reqType, status, data) {
  return {
    type: REQUEST_RESPONSE,
    reqType: reqType,
    status: status,
    data: data,
  };
}

/**
 *
 * If a response was received, it will be handled by this function.
 *
 * @param {Object} state The current Redux state.
 * @param {string} reqType The request type that resulted in this response.
 * @param {int} status The HTTP status code of the request.
 * @param {JSON} data The JSON data returned by the request. May be undefined if the request failed.
 *
 * @return {Object} The new Redux state.
 */
function handleResponse(state, reqType, status, data) {
  // Used for error handling
  var e = "";

  switch (reqType) {
    case GET_CLIPS_MATCHING_FILTER:
      return state;

    case MODIFY_FILTER:
      return state;

    case GET_PROJECTS:
      switch (status) {
        case 200:
          var newList = {};

          // Create project representations
          for (var p of data.projects) {
            // Add projects
            newList[p.id] = new Project(
              p.id,
              p.name,
              p.created,
              p.last_updated,
              p.folders
            );
          }

          return {
            ...state,
            projects: { ...newList },
          };
        default:
          e = "unknown reason";
      }

      break;

    case NEW_PROJECT:
      switch (status) {
        case 200:
          return {
            ...state,
            projectID: data.project_id,
          };
        case 400:
          e = "'project_name' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case DELETE_PROJECT:
      switch (status) {
        case 200:
          return state;
        case 400:
          e = "'project_id' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case RENAME_PROJECT:
      switch (status) {
        case 200:
          return state;
        case 204:
          e = "no project with specified ID";
          break;
        case 400:
          e =
            "'project_id' or 'project_name' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case EXPORT_FILTER:
      return state;

    case EXPORT_CLIPS:
      return state;

    case GET_CLIP_INFO:
      return state;

    case GET_CAMERAS:
      return state;

    case GET_FOLDERS:
      switch (status) {
        case 200:
          return {
            ...state,
            folders: createFolderHierarchy(data.folders),
          };
        case 204:
          e = "no project with specified ID";
          break;
        case 400:
          e = "'project_id' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case GET_SOURCE_FOLDERS:
      switch (status) {
        case 200:
          return {
            ...state,
            sourceFolders: createFolderHierarchy(data.folders),
          };
        default:
          e = "unknown reason";
      }

      break;

    case ADD_FOLDER:
    case REMOVE_FOLDER:
      switch (status) {
        case 200:
          return state;
        case 204:
          e = "no project with specified ID";
          break;
        case 400:
          e = "'project_id' or 'folder_id' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case DETECT_OBJECTS:
      switch (status) {
        case 200:
          return {
            ...state,
            od: { ...state.od, progressID: data.progress_id },
          };
        case 400:
          e = "'clip_ids' or 'rate' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case GET_OD_PROGRESS:
      switch (status) {
        case 200:
          const total = data.total;
          return {
            ...state,
            od: {
              ...state.od,
              currentProgress:
                total > 0 ? parseInt((100 * data.current) / total) : 100,
            },
          };
        case 204:
          e = "no progress with specified ID";
          break;
        case 400:
          e = "'progress_id' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    case DELETE_OD_PROGRESS:
      switch (status) {
        case 200:
          // Reset currentProgress and progressID.
          return {
            ...state,
            od: { ...state.od, progressID: -1, currentProgress: 0 },
          };
        case 204:
          e = "no progress with specified ID";
          break;
        case 400:
          e = "'progress_id' parameter was missing from request";
          break;
        default:
          e = "unknown reason";
      }

      break;

    default:
      return state;
  }

  if (200 < status && status < 300) console.log("Request remark: " + e);
  else if (status != 200)
    console.error("Request '" + reqType + "' failed: " + e);
  return state;
}

/* -- REDUX REDUCER -- */
const communicationReducer = (state = initialState, action) => {
  // Handle response if applicable
  if (action.type == REQUEST_RESPONSE)
    return handleResponse(state, action.reqType, action.status, action.data);

  var url = "";
  var body = {};

  switch (action.type) {
    case GET_CLIPS_MATCHING_FILTER:
      url = URL_GET_CLIPS_MATCHING_FILTER;
      body = {};
      break;

    case MODIFY_FILTER:
      url = URL_MODIFY_FILTER;
      body = {};
      break;

    case GET_AREAS_IN_FILTER:
      url = URL_GET_AREAS_IN_FILTER;
      body = {};
      break;

    case CREATE_AREA:
      url = URL_CREATE_AREA;
      body = {};
      break;

    case GET_FILTER_PARAMS:
      url = URL_GET_FILTER_PARAMS;
      body = {};
      break;

    case GET_PROJECTS:
      url = URL_GET_PROJECTS;
      body = {};
      break;

    case NEW_PROJECT:
      url = URL_NEW_PROJECT;
      body = {
        project_name: action.name,
      };
      break;

    case DELETE_PROJECT:
      url = URL_DELETE_PROJECT;
      body = {
        project_id: action.id,
      };
      break;

    case RENAME_PROJECT:
      url = URL_RENAME_PROJECT;
      body = {
        project_id: action.id,
        project_name: action.name,
      };
      break;

    case EXPORT_FILTER:
      url = URL_EXPORT_FILTER;
      body = {};
      break;

    case EXPORT_CLIPS:
      url = URL_EXPORT_CLIPS;
      body = {};
      break;

    case GET_CLIP_INFO:
      url = URL_GET_CLIP_INFO;
      body = {};
      break;

    case GET_CAMERAS:
      url = URL_GET_CAMERAS;
      body = {};
      break;

    case GET_FOLDERS:
      url = URL_GET_FOLDERS;
      body = { project_id: state.projectID };
      break;

    case GET_SOURCE_FOLDERS:
      url = URL_GET_SOURCE_FOLDERS;
      body = { project_id: state.projectID };
      break;

    case ADD_FOLDER:
      url = URL_ADD_FOLDER;
      body = { project_id: state.projectID, folder_id: action.fid };
      break;

    case REMOVE_FOLDER:
      url = URL_REMOVE_FOLDER;
      body = { project_id: state.projectID, folder_id: action.fid };
      break;

    case DETECT_OBJECTS:
      // TODO: Add clip_ids based on target. Needs information from filter.
      url = URL_DETECT_OBJECTS;
      body = { clip_ids: [], rate: action.rate };
      break;

    case GET_OD_PROGRESS:
      url = URL_GET_OD_PROGRESS;
      body = { progress_id: state.od.progressID };
      break;

    case DELETE_OD_PROGRESS:
      url = URL_DELETE_OD_PROGRESS;
      body = { progress_id: state.od.progressID };
      break;

    default:
      return state;
  }

  // Make request
  makePOST(url, body, (status, data) => {
    store.dispatch(requestResponse(action.type, status, data));
  });

  return state;
};

export default communicationReducer;
