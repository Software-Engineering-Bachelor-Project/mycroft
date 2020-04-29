import store from "./state";

/* -- ACTIONS -- */
export const ZOOM = "ZOOM";
export const SET_START_TIME = "SET_START_TIME";
export const SET_END_TIME = "SET_END_TIME";
export const SET_TIME_LIMITS = "SET_TIME_LIMITS";
export const GB_SET_TIME_LIMITS = "GB_SET_TIME_LIMITS";

/* -- TIMELINE DEFAULT CONSTANT -- */
const defaultStartTime = new Date(2020, 3, 10, 0, 0, 0); // the month is 0-indexed. Month 3 = April.
const defaultEndTime = new Date(2020, 3, 20, 0, 0, 0);
const gbDefaultStartTime = new Date(2020, 3, 14, 12, 30, 0);
const gbDefaultEndTime = new Date(2020, 3, 15, 1, 0, 0);

/* -- INITIAL STATE -- */
export const initialState = {
  scale: 12,
  startTime: defaultStartTime,
  endTime: defaultEndTime,
  timeSpan: defaultEndTime.getTime() - defaultStartTime.getTime(), //timeSpan in ms

  glassbox: {
    startTime: gbDefaultStartTime,
    endTime: gbDefaultEndTime,
    timeSpan: gbDefaultEndTime.getTime() - gbDefaultStartTime.getTime(), //timeSpan in ms
  },
};

/* -- ACTION CREATORS -- */

/**
 * This function changes the scale-state.
 * It depends on what mode viewport is in.
 *
 * @param {Boolean} viewportMode is the mode of viewport
 * @param {int} hrs sets new scale parameter
 */
export function zoom(hrs, viewportMode) {
  return {
    type: ZOOM,
    hrs: hrs,
    viewportMode: viewportMode,
  };
}

/**
 * Updates the startTime of timeline.
 * Updates timeSpan accordingly.
 *
 * @param {Date} date becomes the new startTime
 */
export function setStartTime(date) {
  return {
    type: SET_START_TIME,
    date: date,
  };
}

/**
 * Updates the endTime of timeline.
 * Updates timeSpan accordingly.
 *
 * @param {Date} date becomes the new endTime
 */
export function setEndTime(date) {
  return {
    type: SET_END_TIME,
    date: date,
  };
}

/**
 * Updates the startTime and endTime of timeline.
 * Updates timeSpan accordingly.
 *
 * @param {Date} startDate
 * @param {Date} endDate
 */
export function setTimeLimits(startDate, endDate) {
  return {
    type: SET_TIME_LIMITS,
    start: startDate,
    end: endDate,
  };
}

/**
 * Updates the startTime and endTime of glassbox.
 * Updates timeSpan of glassbox accordingly.
 * If only one input is given, the other will be set to the default time.
 *
 * Example: startDate is given but endDate is set to undefined,
 * then endDate will be set to gbDefaultEndTime.
 * Therefore its possible to only update either one (startTime or endTime).
 *
 * @param {Date} startDate becomes the new startTime of glassbox
 * @param {Date} endDate becomes the new endTime of glassbox
 */
export function gbSetTimeLimits(startDate, endDate) {
  return {
    type: GB_SET_TIME_LIMITS,
    start: startDate,
    end: endDate,
  };
}

/**
 * Checks if startDate is after endDate, and if so throws an error.
 * This function is used when updating either startTime, endTime or both in timeline.
 *
 * @param {Date} startTime startTime of timeline
 * @param {Date} endTime endTime of timeline
 */
function checkTimeSpan(startTime, endTime) {
  if (startTime.getTime() >= endTime.getTime()) {
    console.error("RangeError: endTime before startTime");
  }
}

/**
 * Checks input for GB_SET_TIME_LIMITS
 * If one input is undefined, change it to the state-input for that one.
 * Returns a list of "defined" Date-objects [start, end].
 *
 * Example: start is given but end is set to undefined,
 * then end will be set to state.glassbox.endTime.
 *
 * @param {Date} start
 * @param {Date} end
 * @param {State object} state
 *
function handleGlassboxInput(start, end, state) {
  if (start == undefined && end) {
    return [state.glassbox.startTime, end];
  } else if (start == undefined && end == undefined) {
    console.error("RangeError: StartDate, endDate undefined");
  } else if (start && end == undefined) {
    return [start, state.glassbox.endTime];
  } else {
    return [start, end];
  }
  return [state.glassbox.startTime, state.glassbox.endTime];
}

/**
 * Checks if startTime, endTime of glassbox is contained in timeline,
 * otherwise log an error.
 *
 * @param {Date} start
 * @param {Date} end
 * @param {State object} state
 *
function checkGlassboxTimeSpan(start, end, state) {
  if (
    state.startTime.getTime() < start.getTime() &&
    start.getTime() < state.endTime.getTime()
  ) {
    if (
      state.startTime.getTime() < end.getTime() &&
      end.getTime() < state.endTime.getTime()
    ) {
      if (start.getTime() < end.getTime()) {
        return; // this is the expected behaviour
      } else {
        console.error("RangeError: Glassbox: startTime after endTime");
        return;
      }
    }
  }
  console.error(
    "RangeError: Glassbox: startTime, endTime of glassbox is not contained inside timeline"
  );
  return;
}
*/
/* -- REDUX REDUCER -- */
const timelineReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_START_TIME:
      checkTimeSpan(action.date, state.endTime);
      return {
        ...state,
        startTime: action.date,
        timeSpan: state.endTime.getTime() - action.date.getTime(),
      };
    case SET_END_TIME:
      checkTimeSpan(state.startTime, action.date);
      return {
        ...state,
        endTime: action.date,
        timeSpan: action.date.getTime() - state.startTime.getTime(),
      };
    case SET_TIME_LIMITS:
      checkTimeSpan(action.start, action.end);
      return {
        ...state,
        startTime: action.start,
        endTime: action.end,
        timeSpan: action.end.getTime() - action.start.getTime(),
      };
    case ZOOM:
      //if action.hrs is undefiend, then use state.scale
      var hours = action.hrs ? action.hrs : state.scale;
      return {
        ...state,

        // Compares with timeSpan or glassbox timeSpan depending on mode;
        // if action.hrs is bigger than timeSpan,
        // then timeSpan is the max value for scale.
        scale: action.viewportMode
          ? Math.min(hours, state.timeSpan / (60 * 60 * 1000))
          : Math.min(hours, state.glassbox.timeSpan / (60 * 60 * 1000)),
      };
    case GB_SET_TIME_LIMITS:
      /*var startT, endT;
      [startT, endT] = handleGlassboxInput(action.start, action.end, state);
      checkGlassboxTimeSpan(startT, endT, state);*/
      return {
        ...state,
        glassbox: {
          startTime: action.start,
          endTime: action.end,
          timeSpan: action.end.getTime() - action.start.getTime(),
        },
      };
    default:
      return state;
  }
};

export default timelineReducer;
