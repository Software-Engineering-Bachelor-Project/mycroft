import store from "./state";

import { Camera, Clip } from "../types";

/* -- ACTIONS -- */
export const ZOOM = "ZOOM";
export const SET_START_TIME = "SET_START_TIME";
export const SET_END_TIME = "SET_END_TIME";
export const SET_TIME_LIMITS = "SET_TIME_LIMITS";
export const GB_SET_TIME_LIMITS = "GB_SET_TIME_LIMITS";
export const ADD_CAMERA = "ADD_CAMERA";
export const REMOVE_CAMERA = "REMOVE_CAMERA";

/* -- TIMELINE DEFAULT CONSTANT -- */
const defaultStartTime = new Date(2020, 3, 10, 23, 50, 0); // the month is 0-indexed. Month 3 = April.
const defaultEndTime = new Date(2020, 3, 20, 0, 0, 0);
const gbDefaultStartTime = new Date(2020, 3, 13, 12, 30, 0);
const gbDefaultEndTime = new Date(2020, 3, 14, 18, 0, 0);

//testdata for cameras
const c1StartTime = new Date(2020, 3, 13, 12, 30, 0);
const c1EndTime = new Date(2020, 3, 14, 10, 0, 0);

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

  //testdata
  cameras: {
    1: new Camera(
      1,
      "cam1",
      [2, 2],
      {
        1: new Clip(1, "clip1", "tdir", 1, "tformat", c1StartTime, c1EndTime),
        //2: new Clip(2, "clip2", "tdir", 1, "tformat", c1StartTime, c1EndTime),
      },
      false
    ),
    2: new Camera(
      2,
      "cam2",
      [2, 4],
      { 1: new Clip(1, "clip1", "tdir", 2, "tformat", c1StartTime, c1EndTime) },
      false
    ),
    3: new Camera(
      3,
      "cam3",
      [6, 9],
      { 1: new Clip(1, "clip1", "tdir", 3, "tformat", c1StartTime, c1EndTime) },
      false
    ),
    4: new Camera(
      4,
      "cam4",
      [6, 9],
      {
        1: new Clip(1, "clip1", "tdir", 4, "tformat", c1StartTime, c1EndTime),
        //2: new Clip(2, "clip2", "tdir", 4, "tformat", c1StartTime, c1EndTime),
      },
      false
    ),
    5: new Camera(
      5,
      "cam5",
      [7, 9],
      { 1: new Clip(1, "clip1", "tdir", 5, "tformat", c1StartTime, c1EndTime) },
      false
    ),
    6: new Camera(
      6,
      "cam6",
      [7, 9],
      { 1: new Clip(1, "clip1", "tdir", 6, "tformat", c1StartTime, c1EndTime) },
      false
    ),
    7: new Camera(
      7,
      "cam7",
      [7, 9],
      { 1: new Clip(1, "clip1", "tdir", 7, "tformat", c1StartTime, c1EndTime) },
      false
    ),
    8: new Camera(
      8,
      "cam8",
      [7, 9],
      { 1: new Clip(1, "clip1", "tdir", 8, "tformat", c1StartTime, c1EndTime) },
      false
    ),
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
 * Creates an action used for adding a camera.
 *
 * @param {Camera} camera camera to add.
 * @return {action} Action for adding a camera.
 */
export function addCamera(camera) {
  return {
    type: ADD_CAMERA,
    camera: camera,
  };
}

/**
 * Creates an action used for removing a camera.
 *
 * @param {int} id Unique idenfitifier of a camera to remove.
 * @return {action} Action for removing a camera.
 */
export function removeCamera(id) {
  return {
    type: REMOVE_CAMERA,
    id: id,
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
 */
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
 */
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
      var startT, endT;
      [startT, endT] = handleGlassboxInput(action.start, action.end, state);
      checkGlassboxTimeSpan(startT, endT, state);
      return {
        ...state,
        glassbox: {
          startTime: startT,
          endTime: endT,
          timeSpan: endT.getTime() - startT.getTime(),
        },
      };
    case ADD_CAMERA:
      return {
        ...state,
        cameras: {
          ...state.cameras,
          [action.camera.id]: action.camera,
        },
      };
    case REMOVE_CAMERA:
      var cameras = { ...state.cameras };
      delete cameras[action.id];
      return {
        ...state,
        cameras: cameras,
      };
    default:
      return state;
  }
};

export default timelineReducer;
