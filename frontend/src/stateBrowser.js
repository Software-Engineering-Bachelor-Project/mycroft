import store from './state';


/* -- ACTIONS -- */
const DUMMY = "DUMMY";

/* -- INITIAL STATE -- */
const initialState = {
    //TODO::add states
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
