import store from './state';

/* -- ACTIONS -- */
export const ZOOM = "ZOOM";
export const SET_START_TIME = "SET_START_TIME";
export const SET_END_TIME = "SET_END_TIME";
export const SET_TIME_LIMITS = "SET_TIME_LIMITS";

/* -- INITIAL STATE -- */
export const initialState = {
    scale: 12,
    startTime: undefined,
    endTime: undefined,
    timeSpan: 36*60*60*1000 //36hrs in ms
};

/* -- ACTION CREATORS -- */

// This function changes the scale-state.
export function zoom(hrs) {
    return {
        type: ZOOM,
        hrs: hrs
    };
}

export function setStartTime(date) {
    return {
        type: SET_START_TIME,
        date: date
    };
}

export function setEndTime(date) {
    return {
        type: SET_END_TIME,
        date: date
    };
}

export function setTimeLimits(startDate, endDate) {
    return {
        type: SET_TIME_LIMITS,
        start: startDate,
        end: endDate
    };
}

/* -- REDUX REDUCER -- */
const timelineReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_START_TIME:
            return {
                ...state,
                startTime: action.date,
                timeSpan: state.endTime.getTime() - action.date.getTime()
            };
        case ZOOM:
            return {
                ...state,

                // Compares with timeSpan; if action.hrs is bigger than timeSpan, 
                // then timeSpan is the max value for scale. 
                scale: Math.min(action.hrs, state.timeSpan/(60*60*1000))
            };
        default:
            return state;
    }
};

export default timelineReducer;
