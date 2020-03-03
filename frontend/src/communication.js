/* 
 * This file defines the state, reducers, and actions
 * used for communication between client and server.
 * This includes session IDs, project info, videos etc.
 */


/* -- ACTIONS -- */
const FILTER_VIDEOS    = "FILTER_VIDEOS";
const SAVE_PROJECT     = "SAVE_PROJECT";
const OPEN_PROJECT     = "OPEN_PROJECT";
const GET_PROJECTS     = "GET_PROJECTS";
const EXPORT_FILTER    = "EXPORT_FILTER";
const EXPORT_VIDEOS    = "EXPORT_VIDEOS";
const GET_VIDEO_INFO   = "GET_VIDEO_INFO";
const GET_VIDEO_STREAM = "GET_VIDEO_STREAM";
const SYNC_STATE       = "SYNC_STATE";

/* -- INITIAL STATE -- */
const initialState = {
    projectName: "",
    projectLoaded: false
}

/* -- ACTION CREATORS -- */

// ...
export function filterVideos() {
    return {
	type: FILTER_VIDEOS
    };
}

/* -- REDUX REDUCER -- */
const communicationReducer = (state = initialState, action) => {

    switch (action.type) {
    case FILTER_VIDEOS:
	return state;
    case SAVE_PROJECT:
	return state;
    case OPEN_PROJECT:
	return state;
    case GET_PROJECTS:
	return state;
    case EXPORT_FILTER:
	return state;
    case EXPORT_VIDEOS:
	return state;
    case GET_VIDEO_INFO:
	return state;
    case GET_VIDEO_STREAM:
	return state;
    case SYNC_STATE:
	return state;
    default:
	return state;
    }
}

export default communicationReducer;
