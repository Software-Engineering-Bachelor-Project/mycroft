import store from "./state";

/* -- ACTIONS -- */
export const ZOOM = "ZOOM";
export const SET_START_TIME = "SET_START_TIME";
export const SET_END_TIME = "SET_END_TIME";
export const SET_TIME_LIMITS = "SET_TIME_LIMITS";
export const GB_SET_TIME_LIMITS = "GB_SET_TIME_LIMITS";

/* -- TEMPORARY CONSTANTS -- */
const exStartTime = new Date(2020, 3, 12, 12, 20, 13); // the month is 0-indexed. Month 3 = April.
const exEndTime = new Date(2020, 3, 19, 16, 40, 2);
const gbStartTime = new Date(2020, 3, 14, 12, 30, 0);
const gbEndTime = new Date(2020, 3, 14, 15, 0, 0);


/* -- INITIAL STATE -- */
export const initialState = {
    scale: 12,
    startTime: exStartTime,
    endTime: exEndTime,
    timeSpan: exEndTime.getTime() - exStartTime.getTime(), //timeSpan in ms

    glassbox: {
        startTime: gbStartTime,
        endTime: gbEndTime,
        timeSpan: gbEndTime.getTime() - gbStartTime.getTime() //timeSpan in ms
    }
};

/* -- ACTION CREATORS -- */

// This function changes the scale-state.
export function zoom(hrs) {
  return {
    type: ZOOM,
    hrs: hrs,
  };
}

export function setStartTime(date) {
  return {
    type: SET_START_TIME,
    date: date,
  };
}

export function setEndTime(date) {
  return {
    type: SET_END_TIME,
    date: date,
  };
}

export function setTimeLimits(startDate, endDate) {
  return {
    type: SET_TIME_LIMITS,
    start: startDate,
    end: endDate,
  };
}

export function gbSetTimeLimits(startDate, endDate) {
    return {
        type: GB_SET_TIME_LIMITS,
        start: startDate,
        end: endDate
    };
}

// Checks if startDate is after endDate, and if so throws an error
function checkTimeSpan(startTime, endTime) {
    if(startTime.getTime() >= endTime.getTime()) {
        console.error('RangeError: StartDate before endDate');
    }
}

// Checks input for GB_SET_TIME_LIMITS
// If one input is undefiend, return the initialState input for that one
function handleGlassboxInput(start, end, state) {
    if (start == undefined && end) {
        return [state.startTime, end];
    } else if (start == undefined && end == undefined) {
        console.error('RangeError: StartDate, endDate undefined');
    } else if (start && end == undefined) {
        return [start, state.endTime];
    } else {
        return [start, end];
    }
    return [state.startTime, state.endTime];
}

// Checks if startTime, endTime of glassbox is contained in timeline
function checkGlassboxTimeSpan(start, end, state) {
    if (state.startTime.getTime() < start.getTime() && start.getTime() < state.endTime.getTime()) {
        if (state.startTime.getTime() < end.getTime() && end.getTime() < state.endTime.getTime()) {
            if (start.getTime() < end.getTime()) {
                return; // this is the expected behaviour
            } else {
                console.error('RangeError: Glassbox: startTime after endTime');
                return;
            }
        }
    }
    console.error('RangeError: Glassbox: startTime, endTime of glassbox is not contained inside timeline');
    return;
}

/* -- REDUX REDUCER -- */
const timelineReducer = (state = initialState, action) => {
    switch(action.type) {
        case SET_START_TIME:
            checkTimeSpan(action.date, state.endTime);
            return {
                ...state,
                startTime: action.date,
                timeSpan: state.endTime.getTime() - action.date.getTime()
            };
        case SET_END_TIME:
            checkTimeSpan(state.startTime, action.date);
            return {
                ...state,
                endTime: action.date,
                timeSpan: action.date.getTime() - state.startTime.getTime()
            };
        case SET_TIME_LIMITS:
            checkTimeSpan(action.start, action.end);
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
        case GB_SET_TIME_LIMITS:
            let start, end;
            [start, end] = handleGlassboxInput(action.start, action.end);
            checkGlassboxTimeSpan(start, end, state);
            return {
                ...state.glassbox,
                startTime: start,
                endTime: end,
                timeSpan: end.getTime() - start.getTime()
            };
        default:
            return state;
    }
};

export default timelineReducer;
