import store from './state';

import { Camera, Clip } from './types';


/* -- ACTIONS -- */
const DUMMY = "DUMMY";

/* -- INITIAL STATE -- */
const initialState = {
    cameras: {
       1: new Camera(1, "cam1", [2,2], {
               1: new Clip(1, "clip1", "testfolder", "testformat", "start", "end"),
               2: new Clip(2, "clio1.2", "testfolder", "testformat", "start", "end")
            }, false),
       2: new Camera(2, "cam", [2,4], {1: new Clip(1, "clip2", "testfolder", "testformat", "start", "end")}, false),
       3: new Camera(3, "cam3", [6,9], {1: new Clip(1, "clip3", "testfolder", "testformat", "start", "end")}, false),
       4: new Camera(4, "cam3", [6,9], {1: new Clip(1, "clip3", "testfolder", "testformat", "start", "end")}, false),
       5: new Camera(5, "cam3", [6,9], {1: new Clip(1, "clip3", "testfolder", "testformat", "start", "end")}, false),
   }
}

/* -- ACTION CREATORS -- */
export function dummy() {
    return {
	    type: DUMMY
    }
}

/* -- REDUX REDUCER -- */
const browserReducer = (state = initialState, action) => {
    switch(action.type) {
    case DUMMY:
        return state;
    default:
	    return state;
    }
}

export default browserReducer;
