import { makePOST } from './util';

/* 
 * This file defines the state, reducers, and actions
 * used for communication between client and server.
 */

/* -- ACTIONS -- */

// For server requests such as POST, create
// two actions prefixed with REQ and RCV since
// the response must be handled separately.

// Filter Module requests
const REQ_GET_CLIPS_MATCHING_FILTER = 'REQ_GET_CLIPS_MATCHING_FILTER';
const RCV_GET_CLIPS_MATCHING_FILTER = 'RCV_GET_CLIPS_MATCHING_FILTER';

const REQ_MODIFY_FILTER             = 'REQ_MODIFY_FILTER';
const RCV_MODIFY_FILTER             = 'RCV_MODIFY_FILTER';

// Project Manager requests
const REQ_GET_PROJECTS              = 'REQ_GET_PROJECTS';
const RCV_GET_PROJECTS              = 'RCV_GET_PROJECTS';

const REQ_NEW_PROJECT               = 'REQ_NEW_PROJECT';
const RCV_NEW_PROJECT               = 'RCV_NEW_PROJECT';

const REQ_DELETE_PROJECT            = 'REQ_DELETE_PROJECT';
const RCV_DELETE_PROJECT            = 'RCV_DELETE_PROJECT';

const REQ_RENAME_PROJECT            = 'REQ_RENAME_PROJECT';
const RCV_RENAME_PROJECT            = 'RCV_RENAME_PROJECT';

// Exporter requests
const REQ_EXPORT_FILTER             = 'REQ_EXPORT_FILTER';
const RCV_EXPORT_FILTER             = 'RCV_EXPORT_FILTER';

const REQ_EXPORT_CLIPS              = 'REQ_EXPORT_CLIPS';
const RCV_EXPORT_CLIPS              = 'RCV_EXPORT_CLIPS';

// Video Manager requests
const REQ_GET_CLIP_INFO             = 'REQ_GET_CLIP_INFO';
const RCV_GET_CLIP_INFO             = 'RCV_GET_CLIP_INFO';

const REQ_GET_CAMERAS               = 'REQ_GET_CAMERAS';
const RCV_GET_CAMERAS               = 'RCV_GET_CAMERAS';

// File Manager requests
const REQ_GET_FOLDERS               = 'REQ_GET_FOLDERS';
const RCV_GET_FOLDERS               = 'RCV_GET_FOLDERS';

const REQ_GET_SOURCE_FOLDERS        = 'REQ_GET_SOURCE_FOLDERS';
const RCV_GET_SOURCE_FOLDERS        = 'RCV_GET_SOURCE_FOLDERS';

const REQ_ADD_FOLDER                = 'REQ_ADD_FOLDER';
const RCV_ADD_FOLDER                = 'RCV_ADD_FOLDER';

// Object Detector requests
const REQ_DETECT_OBJECTS            = 'REQ_DETECT_OBJECTS';
const RCV_DETECT_OBJECTS            = 'RCV_DETECT_OBJECTS';

const REQ_GET_OD_PROGRESS            = 'REQ_GET_OD_PROGRESS';
const RCV_GET_OD_PROGRESS            = 'RCV_GET_OD_PROGRESS';

const REQ_DELETE_OD_PROGRESS        = 'REQ_DELETE_OD_PROGRESS';
const RCV_DELETE_OD_PROGRESS        = 'RCV_DELETE_OD_PROGRESS';

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
export function reqGetClipsMatchingFilter() {
    return {
        type: REQ_GET_CLIPS_MATCHING_FILTER
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetClipsMatchingFilter() {
    return {
        type: RCV_GET_CLIPS_MATCHING_FILTER
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqModifyFilter() {
    return {
        type: REQ_MODIFY_FILTER
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvModifyFilter() {
    return {
        type: RCV_MODIFY_FILTER
    };
}

// Project Manager requests
/**
 * TODO: Add doc-comment
 */
export function reqGetProjects() {
    return {
        type: REQ_GET_PROJECTS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetProjects() {
    return {
        type: RCV_GET_PROJECTS
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqNewProject() {
    return {
        type: REQ_NEW_PROJECT
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvNewProject() {
    return {
        type: RCV_NEW_PROJECT
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqDeleteProject() {
    return {
        type: REQ_DELETE_PROJECT
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvDeleteProject() {
    return {
        type: RCV_DELETE_PROJECT
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqRenameProject() {
    return {
        type: REQ_RENAME_PROJECT
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvRenameProject() {
    return {
        type: RCV_RENAME_PROJECT
    };
}

// Exporter requests
/**
 * TODO: Add doc-comment
 */
export function reqExportFilter() {
    return {
        type: REQ_EXPORT_FILTER
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvExportFilter() {
    return {
        type: RCV_EXPORT_FILTER
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqExportClips() {
    return {
        type: REQ_EXPORT_CLIPS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvExportClips() {
    return {
        type: RCV_EXPORT_CLIPS
    };
}

// Video Manager requests
/**
 * TODO: Add doc-comment
 */
export function reqGetClipInfo() {
    return {
        type: REQ_GET_CLIP_INFO
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetClipInfo() {
    return {
        type: RCV_GET_CLIP_INFO
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqGetCameras() {
    return {
        type: REQ_GET_CAMERAS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetCameras() {
    return {
        type: RCV_GET_CAMERAS
    };
}

// File Manager requests
/**
 * TODO: Add doc-comment
 */
export function reqGetFolders() {
    return {
        type: REQ_GET_FOLDERS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetFolders() {
    return {
        type: RCV_GET_FOLDERS
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqGetSourceFolders() {
    return {
        type: REQ_GET_SOURCE_FOLDERS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetSourceFolders() {
    return {
        type: RCV_GET_SOURCE_FOLDERS
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqAddFolders() {
    return {
        type: REQ_ADD_FOLDERS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvAddFolders() {
    return {
        type: RCV_ADD_FOLDERS
    };
}

// Object Detector requests
/**
 * TODO: Add doc-comment
 */
export function reqDetectObjects() {
    return {
        type: REQ_DETECT_OBJECTS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvDetectObjects() {
    return {
        type: RCV_DETECT_OBJECTS
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqGetODProgress() {
    return {
        type: REQ_GET_OD_PROGRESS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvGetODProgress() {
    return {
        type: RCV_GET_OD_PROGRESS
    };
}


/**
 * TODO: Add doc-comment
 */
export function reqDeleteODProgress() {
    return {
        type: REQ_DELETE_OD_PROGRESS
    };
}

/**
 * TODO: Add doc-comment
 */
function rcvDeleteODProgress() {
    return {
        type: RCV_DELETE_OD_PROGRESS
    };
}

/* -- REDUX REDUCER -- */
const communicationReducer = (state = initialState, action) => {

    switch (action.type) {
    case REQ_GET_CLIPS_MATCHING_FILTER:
        return state;
    case RCV_GET_CLIPS_MATCHING_FILTER:
        return state;

    case REQ_MODIFY_FILTER:
        return state;
    case RCV_MODIFY_FILTER:
        return state;
        
    case REQ_GET_PROJECTS:
        return state;
    case RCV_GET_PROJECTS:
        return state;

    case REQ_NEW_PROJECT:
        return state;
    case RCV_NEW_PROJECT:
        return state;

    case REQ_DELETE_PROJECT:
        return state;
    case RCV_DELETE_PROJECT:
        return state;

    case REQ_RENAME_PROJECT:
        return state;
    case RCV_RENAME_PROJECT:
        return state;
        
    case REQ_EXPORT_FILTER:
        return state;
    case RCV_EXPORT_FILTER:
        return state;

    case REQ_EXPORT_CLIPS:
        return state;
    case RCV_EXPORT_CLIPS:
        return state;
        
    case REQ_GET_CLIP_INFO:
        return state;
    case RCV_GET_CLIP_INFO:
        return state;

    case REQ_GET_CAMERAS:
        return state;
    case RCV_GET_CAMERAS:
        return state;
        
    case REQ_GET_FOLDERS:
        return state;
    case RCV_GET_FOLDERS:
        return state;

    case REQ_GET_SOURCE_FOLDERS:
        return state;
    case RCV_GET_SOURCE_FOLDERS:
        return state;

    case REQ_ADD_FOLDER:
        return state;
    case RCV_ADD_FOLDER:
        return state;
        
    case REQ_DETECT_OBJECTS:
        return state;
    case RCV_DETECT_OBJECTS:
        return state;

    case REQ_GET_OD_PROGRESS:
        return state;
    case RCV_GET_OD_PROGRESS:
        return state;

    case REQ_DELETE_OD_PROGRESS:
        return state;
    case RCV_DELETE_OD_PROGRESS:
        return state;
    
    default:
        return state;
    }
};

export default communicationReducer;
