import store from './state';

/* -- ACTIONS -- */
export const ZOOM = "ZOOM";
export const SET_START_TIME = "SET_START_TIME";
export const SET_END_TIME = "SET_END_TIME";
export const SET_TIME_LIMITS = "SET_TIME_LIMITS";

/* -- TEMPORARY CONSTANTS -- */
const exStartTime = new Date(2020, 3, 17, 12, 0, 0); // the month is 0-indexed. Month 3 = April.
const exEndTime = new Date(2020, 3, 19, 0, 0, 0);

/* -- INITIAL STATE -- */
export const initialState = {
    scale: 12,
    startTime: exStartTime,
    endTime: exEndTime,
    timeSpan: 36 * 60 * 60 * 1000 //timeSpan in ms
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

// Checks if startDate is before endDate, and if so throws an error
export function checkTimeSpan(startDate, endDate) {
    try {
        if(startDate.getTime() >= endDate.getTime()) throw new RangeError('StartDate before endDate');
    }
    catch(e) {
        console.error(e.name, ': ', e.message);
    }
}

/* -- REDUX REDUCER -- */
const timelineReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_START_TIME:
            checkTimeSpan(action.date, state.endTime)
            return {
                ...state,
                startTime: action.date,
                timeSpan: state.endTime.getTime() - action.date.getTime()
            };
        case SET_END_TIME:
            checkTimeSpan(state.startTime, action.date)
            return {
                ...state,
                endTime: action.date,
                timeSpan: action.date.getTime() - state.startTime.getTime()
            };
        case SET_TIME_LIMITS:
            checkTimeSpan(action.start, action.end)
            return {
                ...state,
                startTime: action.start,
                endTime: action.end,
                timeSpan: action.end.getTime() - action.start.getTime()
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
