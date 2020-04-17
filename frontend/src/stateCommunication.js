import { makePOST } from './util';

/* 
 * This file defines the state, reducers, and actions
 * used for communication between client and server.
 */

/* -- ACTIONS -- */

// Filter Module requests
const GET_CLIPS_MATCHING_FILTER = 'GET_CLIPS_MATCHING_FILTER';
const MODIFY_FILTER             = 'MODIFY_FILTER';

// Project Manager requests
const GET_PROJECTS              = 'GET_PROJECTS';
const NEW_PROJECT               = 'NEW_PROJECT';
const DELETE_PROJECT            = 'DELETE_PROJECT';
const RENAME_PROJECT            = 'RENAME_PROJECT';

// Exporter requests
const EXPORT_FILTER             = 'EXPORT_FILTER';
const EXPORT_CLIPS              = 'EXPORT_CLIPS';

// Video Manager requests
const GET_CLIP_INFO             = 'GET_CLIP_INFO';
const GET_CAMERAS               = 'GET_CAMERAS';

// File Manager requests
const GET_FOLDERS               = 'GET_FOLDERS';
const GET_SOURCE_FOLDERS        = 'GET_SOURCE_FOLDERS';
const ADD_FOLDER                = 'ADD_FOLDER';

// Object Detector requests
const DETECT_OBJECTS            = 'DETECT_OBJECTS';
const GET_OD_PROGRESS           = 'GET_OD_PROGRESS';
const DELETE_OD_PROGRESS        = 'DELETE_OD_PROGRESS';

// Response
const REQUEST_RESPONSE          = 'REQUEST_RESPONSE';

/* -- INITIAL STATE -- */
const initialState = {
    projectName: '',
    projectLoaded: false
};

/* -- ACTION CREATORS -- */

// Filter Module requests
/**
 * TODO: Add doc-comment
 */
export function getClipsMatchingFilter() {
    return {
        type: GET_CLIPS_MATCHING_FILTER
    };
}


/**
 * TODO: Add doc-comment
 */
export function modifyFilter() {
    return {
        type: MODIFY_FILTER
    };
}


// Project Manager requests
/**
 * TODO: Add doc-comment
 */
export function getProjects() {
    return {
        type: GET_PROJECTS
    };
}


/**
 * TODO: Add doc-comment
 */
export function newProject() {
    return {
        type: NEW_PROJECT
    };
}


/**
 * TODO: Add doc-comment
 */
export function deleteProject() {
    return {
        type: DELETE_PROJECT
    };
}


/**
 * TODO: Add doc-comment
 */
export function renameProject() {
    return {
        type: RENAME_PROJECT
    };
}


// Exporter requests
/**
 * TODO: Add doc-comment
 */
export function exportFilter() {
    return {
        type: EXPORT_FILTER
    };
}


/**
 * TODO: Add doc-comment
 */
export function exportClips() {
    return {
        type: EXPORT_CLIPS
    };
}


// Video Manager requests
/**
 * TODO: Add doc-comment
 */
export function getClipInfo() {
    return {
        type: GET_CLIP_INFO
    };
}


/**
 * TODO: Add doc-comment
 */
export function getCameras() {
    return {
        type: GET_CAMERAS
    };
}


// File Manager requests
/**
 * TODO: Add doc-comment
 */
export function getFolders() {
    return {
        type: GET_FOLDERS
    };
}


/**
 * TODO: Add doc-comment
 */
export function getSourceFolders() {
    return {
        type: GET_SOURCE_FOLDERS
    };
}


/**
 * TODO: Add doc-comment
 */
export function addFolders() {
    return {
        type: ADD_FOLDERS
    };
}


// Object Detector requests
/**
 * TODO: Add doc-comment
 */
export function detectObjects() {
    return {
        type: DETECT_OBJECTS
    };
}


/**
 * TODO: Add doc-comment
 */
export function getODProgress() {
    return {
        type: GET_OD_PROGRESS
    };
}


/**
 * TODO: Add doc-comment
 */
export function deleteODProgress() {
    return {
        type: DELETE_OD_PROGRESS
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
        data: data
    };
}


/* -- REDUX REDUCER -- */
const communicationReducer = (state = initialState, action) => {

    switch (action.type) {
    case GET_CLIPS_MATCHING_FILTER:
        return state;
    
    case MODIFY_FILTER:
        return state;
        
    case GET_PROJECTS:
        return state;

    case NEW_PROJECT:
        return state;

    case DELETE_PROJECT:
        return state;

    case RENAME_PROJECT:
        return state;
        
    case EXPORT_FILTER:
        return state;

    case EXPORT_CLIPS:
        return state;
        
    case GET_CLIP_INFO:
        return state;

    case GET_CAMERAS:
        return state;
        
    case GET_FOLDERS:
        return state;

    case GET_SOURCE_FOLDERS:
        return state;

    case ADD_FOLDER:
        return state;
        
    case DETECT_OBJECTS:
        return state;

    case GET_OD_PROGRESS:
        return state;

    case DELETE_OD_PROGRESS:
        return state;
        
    case REQUEST_RESPONSE:

        /* REQUEST RESPONSE HANDLING */
        switch(action.reqType) {
        case GET_CLIPS_MATCHING_FILTER:
            return state;
            
        case MODIFY_FILTER:
            return state;
            
        case GET_PROJECTS:
            return state;

        case NEW_PROJECT:
            return state;

        case DELETE_PROJECT:
            return state;

        case RENAME_PROJECT:
            return state;
            
        case EXPORT_FILTER:
            return state;

        case EXPORT_CLIPS:
            return state;
            
        case GET_CLIP_INFO:
            return state;

        case GET_CAMERAS:
            return state;
            
        case GET_FOLDERS:
            return state;

        case GET_SOURCE_FOLDERS:
            return state;

        case ADD_FOLDER:
            return state;
            
        case DETECT_OBJECTS:
            return state;

        case GET_OD_PROGRESS:
            return state;

        case DELETE_OD_PROGRESS:
            return state;
        }
    
    default:
        return state;
    }
};

export default communicationReducer;
